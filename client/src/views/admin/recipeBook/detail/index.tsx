import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdAccessTime, MdPeople, MdRestaurant, MdPlayArrow, MdPause, MdReplay, MdStop } from 'react-icons/md';
import { Recipe, getRecipeById } from 'services/recipe';
import { RecipeProvider } from '../contexts/RecipeContext';
import { showErrorToast } from 'utils/toast';
import Card from 'components/card';
import { getCookingSession, saveCookingSession, deleteCookingSession } from 'services/cookingSession';
import { usePageTitle } from 'contexts/PageTitleContext';

const RecipeDetailContent = () => {
  const { recipeId } = useParams<{ recipeId: string }>();
  const navigate = useNavigate();
  const { setPageTitle } = usePageTitle();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());
  const [checkedSteps, setCheckedSteps] = useState<Set<string>>(new Set());
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [pauseTime, setPauseTime] = useState<Date | null>(null);
  const [totalPauseDuration, setTotalPauseDuration] = useState(0); // in milliseconds
  const [currentTime, setCurrentTime] = useState(new Date()); // For live timer updates
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load recipe and cooking session on mount
  useEffect(() => {
    const fetchRecipeAndSession = async () => {
      if (!recipeId) return;

      setLoading(true);
      try {
        // Fetch recipe
        const recipeData = await getRecipeById(recipeId);
        if (recipeData) {
          setRecipe(recipeData);
          document.title = `${recipeData.title} - Recipe Book`;
          setPageTitle(recipeData.title);

          // Fetch cooking session
          const sessionResponse = await getCookingSession(recipeId);
          if (sessionResponse.success && sessionResponse.data) {
            const session = sessionResponse.data;

            // Restore session state
            setIsPlaying(session.isPlaying);
            setIsPaused(session.isPaused);
            setStartTime(session.startTime ? new Date(session.startTime) : null);
            setPauseTime(session.pauseTime ? new Date(session.pauseTime) : null);
            setTotalPauseDuration(session.totalPauseDuration);

            // Restore checked steps
            const stepsSet = new Set<string>();
            session.checkedSteps.forEach(index => {
              if (recipeData.directions[index]) {
                stepsSet.add(recipeData.directions[index].id);
              }
            });
            setCheckedSteps(stepsSet);
          }
        } else {
          showErrorToast('Recipe not found');
          navigate('/admin/recipe-book/all');
        }
      } catch (error) {
        showErrorToast('Failed to load recipe');
        console.error('Error fetching recipe:', error);
        navigate('/admin/recipe-book/all');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeAndSession();

    // Cleanup: Reset page title when leaving
    return () => {
      setPageTitle('');
    };
  }, [recipeId, navigate, setPageTitle]);

  // Auto-save cooking session when state changes (with debouncing)
  useEffect(() => {
    if (!recipeId || !recipe || loading) return;

    // Only save if there's an active session (playing or paused)
    if (!isPlaying && !isPaused && !startTime) return;

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce: save after 500ms of no changes
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        // Convert checked steps Set to array of indices
        const checkedStepsArray: number[] = [];
        recipe.directions.forEach((direction, index) => {
          if (checkedSteps.has(direction.id)) {
            checkedStepsArray.push(index);
          }
        });

        await saveCookingSession(recipeId, {
          isPlaying,
          isPaused,
          startTime: startTime ? startTime.toISOString() : null,
          pauseTime: pauseTime ? pauseTime.toISOString() : null,
          totalPauseDuration,
          checkedSteps: checkedStepsArray,
          recipeId,
          userId: 'default-user',
          updatedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Failed to save cooking session:', error);
      }
    }, 500);

    // Cleanup timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [recipeId, recipe, loading, isPlaying, isPaused, startTime, pauseTime, totalPauseDuration, checkedSteps]);

  // Live timer update when playing
  useEffect(() => {
    if (isPlaying && !isPaused) {
      // Update current time every second
      timerIntervalRef.current = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
    } else {
      // Clear interval when paused or stopped
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isPlaying, isPaused]);

  const toggleIngredient = (id: string) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedIngredients(newChecked);
  };

  const toggleStep = (id: string) => {
    const newChecked = new Set(checkedSteps);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedSteps(newChecked);
  };

  const handlePlay = async () => {
    const now = new Date();
    let newStartTime = startTime;
    let newTotalPauseDuration = totalPauseDuration;

    if (isPaused && pauseTime) {
      // Resuming from pause - add the paused duration
      const pauseDuration = now.getTime() - pauseTime.getTime();
      newTotalPauseDuration = totalPauseDuration + pauseDuration;
      setTotalPauseDuration(newTotalPauseDuration);
      setPauseTime(null);
    } else if (!startTime) {
      // Starting fresh
      newStartTime = now;
      setStartTime(now);
      newTotalPauseDuration = 0;
      setTotalPauseDuration(0);
    }

    setIsPlaying(true);
    setIsPaused(false);

    // Save immediately to database
    if (recipeId && recipe) {
      try {
        const checkedStepsArray: number[] = [];
        recipe.directions.forEach((direction, index) => {
          if (checkedSteps.has(direction.id)) {
            checkedStepsArray.push(index);
          }
        });

        await saveCookingSession(recipeId, {
          isPlaying: true,
          isPaused: false,
          startTime: newStartTime ? newStartTime.toISOString() : null,
          pauseTime: null,
          totalPauseDuration: newTotalPauseDuration,
          checkedSteps: checkedStepsArray,
          recipeId,
          userId: 'default-user',
          updatedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Failed to save cooking session on play:', error);
      }
    }
  };

  const handlePause = async () => {
    const now = new Date();
    setPauseTime(now);
    setIsPaused(true);
    setIsPlaying(false);

    // Save immediately to database
    if (recipeId && recipe) {
      try {
        const checkedStepsArray: number[] = [];
        recipe.directions.forEach((direction, index) => {
          if (checkedSteps.has(direction.id)) {
            checkedStepsArray.push(index);
          }
        });

        await saveCookingSession(recipeId, {
          isPlaying: false,
          isPaused: true,
          startTime: startTime ? startTime.toISOString() : null,
          pauseTime: now.toISOString(),
          totalPauseDuration,
          checkedSteps: checkedStepsArray,
          recipeId,
          userId: 'default-user',
          updatedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Failed to save cooking session on pause:', error);
      }
    }
  };

  const handleStop = async () => {
    setIsPlaying(false);
    setIsPaused(false);
    setStartTime(null);
    setPauseTime(null);
    setTotalPauseDuration(0);

    // Delete cooking session from database
    if (recipeId) {
      try {
        await deleteCookingSession(recipeId);
      } catch (error) {
        console.error('Failed to delete cooking session:', error);
      }
    }
  };

  const handleReset = async () => {
    setCheckedSteps(new Set());
    setIsPlaying(false);
    setIsPaused(false);
    setStartTime(null);
    setPauseTime(null);
    setTotalPauseDuration(0);

    // Delete cooking session from database
    if (recipeId) {
      try {
        await deleteCookingSession(recipeId);
      } catch (error) {
        console.error('Failed to delete cooking session:', error);
      }
    }
  };

  // Helper function to convert time value and unit to milliseconds
  const getMilliseconds = (value: number, unit: string): number => {
    switch (unit) {
      case 'minutes':
        return value * 60 * 1000;
      case 'hours':
        return value * 60 * 60 * 1000;
      case 'days':
        return value * 24 * 60 * 60 * 1000;
      default:
        return 0;
    }
  };

  // Calculate expected completion time for each step
  const getStepCompletionTime = (stepIndex: number): Date | null => {
    if (!startTime || !recipe) return null;

    let cumulativeTime = 0;

    // Sum up all durations up to and including this step
    for (let i = 0; i <= stepIndex; i++) {
      const direction = recipe.directions[i];
      if (direction.timeValue && direction.timeUnit) {
        cumulativeTime += getMilliseconds(direction.timeValue, direction.timeUnit);
      }
    }

    // Calculate completion time: start time + cumulative duration + total pause duration
    const completionTime = new Date(startTime.getTime() + cumulativeTime + totalPauseDuration);
    return completionTime;
  };

  // Format the completion time based on duration
  const formatCompletionTime = (date: Date, timeUnit?: string): string => {
    if (timeUnit === 'days') {
      // For days, show full date and time
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      // For minutes/hours, show time only
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };


  if (loading) {
    return (
      <div className="mt-3 flex items-center justify-center py-20">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading recipe...</div>
      </div>
    );
  }

  if (!recipe) {
    return null;
  }

  return (
    <div className="mt-3">
      {/* Notes Section - Quote Style */}
      {recipe.notes && (
        <Card extra="w-full p-6 mb-5">
          <div className="border-l-4 border-brand-500 pl-4 py-2">
            <p className="text-sm italic text-gray-600 dark:text-gray-400">
              "{recipe.notes}"
            </p>
          </div>
        </Card>
      )}

      <Card extra="w-full p-6">
        {/* Ingredients and Directions - 2 Column Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Ingredients List - 5 columns */}
          <div className="col-span-5">
            {/* Summary Section */}
            <div className="mb-4 flex items-center gap-4 rounded-lg bg-gray-50 dark:bg-navy-800 p-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <MdRestaurant className="h-4 w-4 text-brand-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Ingredients:</span>
                <span className="text-sm font-semibold text-navy-700 dark:text-white">
                  {recipe.ingredients.length}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <MdAccessTime className="h-4 w-4 text-brand-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Time:</span>
                <span className="text-sm font-semibold text-navy-700 dark:text-white">
                  {recipe.totalTime}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <MdPeople className="h-4 w-4 text-brand-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Serving Size:</span>
                <span className="text-sm font-semibold text-navy-700 dark:text-white">
                  {recipe.servingSize}
                </span>
              </div>
            </div>
            <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-3">
              Ingredients
            </h3>
            <div className="space-y-2">
              {recipe.ingredients.map((ingredient) => (
                <div
                  key={ingredient.id}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-navy-800 transition-colors"
                >
                  <input
                    type="checkbox"
                    id={`ingredient-${ingredient.id}`}
                    checked={checkedIngredients.has(ingredient.id)}
                    onChange={() => toggleIngredient(ingredient.id)}
                    className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                  />
                  <label
                    htmlFor={`ingredient-${ingredient.id}`}
                    className={`flex-1 cursor-pointer text-sm ${
                      checkedIngredients.has(ingredient.id)
                        ? 'line-through text-gray-400'
                        : 'text-navy-700 dark:text-white'
                    }`}
                  >
                    <span className="font-medium">{ingredient.quantity} {ingredient.unit}</span>{' '}
                    {ingredient.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Directions Timeline - 7 columns */}
          <div className="col-span-7">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-navy-700 dark:text-white">
                Directions
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePlay}
                  disabled={isPlaying && !isPaused}
                  className="p-2 rounded-md bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Play"
                >
                  <MdPlayArrow className="h-5 w-5" />
                </button>
                <button
                  onClick={handlePause}
                  disabled={!isPlaying || isPaused}
                  className="p-2 rounded-md bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Pause"
                >
                  <MdPause className="h-5 w-5" />
                </button>
                <button
                  onClick={handleReset}
                  className="p-2 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
                  title="Reset"
                >
                  <MdReplay className="h-5 w-5" />
                </button>
                <button
                  onClick={handleStop}
                  disabled={!isPlaying && !isPaused}
                  className="p-2 rounded-md bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Stop"
                >
                  <MdStop className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {recipe.directions.map((direction, index) => (
                <div key={direction.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <input
                      type="checkbox"
                      id={`step-${direction.id}`}
                      checked={checkedSteps.has(direction.id)}
                      onChange={() => toggleStep(direction.id)}
                      className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                    />
                    {index < recipe.directions.length - 1 && (
                      <div className="w-px h-full bg-gray-300 dark:bg-navy-600 mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-sm font-bold">
                        {direction.step}
                      </span>
                      {direction.duration && (
                        <span className="text-xs font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 px-2 py-1 rounded">
                          {direction.duration}
                        </span>
                      )}
                      {(isPlaying || isPaused) && startTime && direction.timeValue && (
                        <>
                          <span className="text-xs text-gray-400">→</span>
                          <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                            {formatCompletionTime(
                              getStepCompletionTime(index)!,
                              direction.timeUnit
                            )}
                          </span>
                        </>
                      )}
                      {isPaused && (
                        <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded">
                          Paused
                        </span>
                      )}
                    </div>
                    <label
                      htmlFor={`step-${direction.id}`}
                      className={`cursor-pointer text-sm ${
                        checkedSteps.has(direction.id)
                          ? 'line-through text-gray-400'
                          : 'text-navy-700 dark:text-white'
                      }`}
                    >
                      {direction.instruction}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

const RecipeDetail = () => {
  return (
    <RecipeProvider>
      <RecipeDetailContent />
    </RecipeProvider>
  );
};

export default RecipeDetail;
