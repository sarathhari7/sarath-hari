require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const admin = require('firebase-admin');

// Initialize Firebase Admin
const initializeFirebaseAdmin = () => {
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
  }
};

initializeFirebaseAdmin();
const db = admin.firestore();

const mockRecipes = [
  {
    title: 'Classic Margherita Pizza',
    description: 'Traditional Italian pizza with tomato, mozzarella, and fresh basil',
    category: 'Main Course',
    servingSize: 4,
    totalTime: '45 mins',
    totalTimeValue: 45,
    totalTimeUnit: 'minutes',
    isFavorite: true,
    ingredients: [
      { id: '1', name: 'Pizza dough', quantity: '1', unit: 'piece' },
      { id: '2', name: 'Tomato sauce', quantity: '1', unit: 'cup' },
      { id: '3', name: 'Mozzarella cheese', quantity: '200', unit: 'g' },
      { id: '4', name: 'Fresh basil', quantity: '10', unit: 'pieces' },
      { id: '5', name: 'Olive oil', quantity: '2', unit: 'tbsp' },
    ],
    directions: [
      { id: '1', step: 1, instruction: 'Preheat oven to 475°F (245°C)', duration: '5 mins', timeValue: 5, timeUnit: 'minutes' },
      { id: '2', step: 2, instruction: 'Roll out pizza dough on a floured surface', duration: '10 mins', timeValue: 10, timeUnit: 'minutes' },
      { id: '3', step: 3, instruction: 'Spread tomato sauce and add toppings', duration: '5 mins', timeValue: 5, timeUnit: 'minutes' },
      { id: '4', step: 4, instruction: 'Bake until crust is golden and cheese is bubbly', duration: '15 mins', timeValue: 15, timeUnit: 'minutes' },
      { id: '5', step: 5, instruction: 'Garnish with fresh basil and drizzle with olive oil', duration: '5 mins', timeValue: 5, timeUnit: 'minutes' },
    ],
  },
  {
    title: 'Homemade Grape Wine',
    description: 'Traditional grape wine fermentation process',
    category: 'Beverages',
    servingSize: 20,
    totalTime: '45 days',
    totalTimeValue: 45,
    totalTimeUnit: 'days',
    isFavorite: false,
    ingredients: [
      { id: '1', name: 'Fresh grapes', quantity: '10', unit: 'kg' },
      { id: '2', name: 'Sugar', quantity: '2', unit: 'kg' },
      { id: '3', name: 'Wine yeast', quantity: '10', unit: 'g' },
      { id: '4', name: 'Water', quantity: '5', unit: 'l' },
    ],
    directions: [
      { id: '1', step: 1, instruction: 'Wash and crush the grapes thoroughly', duration: 'Day 1', timeValue: 1, timeUnit: 'days' },
      { id: '2', step: 2, instruction: 'Add sugar and yeast, cover with cloth', duration: 'Day 1', timeValue: 1, timeUnit: 'days' },
      { id: '3', step: 3, instruction: 'Stir the mixture daily and check for fermentation', duration: 'Day 3', timeValue: 3, timeUnit: 'days' },
      { id: '4', step: 4, instruction: 'Strain the liquid and transfer to fermentation bottle', duration: 'Day 7', timeValue: 7, timeUnit: 'days' },
      { id: '5', step: 5, instruction: 'Allow secondary fermentation in dark place', duration: 'Day 30', timeValue: 30, timeUnit: 'days' },
      { id: '6', step: 6, instruction: 'Bottle the wine and age for additional days', duration: 'Day 45', timeValue: 45, timeUnit: 'days' },
    ],
  },
  {
    title: 'Chocolate Fudge Cake',
    description: 'Rich, moist chocolate cake with silky chocolate frosting',
    category: 'Desserts',
    servingSize: 12,
    totalTime: '2 hours',
    totalTimeValue: 2,
    totalTimeUnit: 'hours',
    isFavorite: true,
    ingredients: [
      { id: '1', name: 'All-purpose flour', quantity: '2', unit: 'cups' },
      { id: '2', name: 'Cocoa powder', quantity: '3/4', unit: 'cup' },
      { id: '3', name: 'Sugar', quantity: '2', unit: 'cups' },
      { id: '4', name: 'Baking soda', quantity: '2', unit: 'tsp' },
      { id: '5', name: 'Eggs', quantity: '2', unit: 'pieces' },
      { id: '6', name: 'Buttermilk', quantity: '1', unit: 'cup' },
      { id: '7', name: 'Vegetable oil', quantity: '1/2', unit: 'cup' },
      { id: '8', name: 'Vanilla extract', quantity: '2', unit: 'tsp' },
      { id: '9', name: 'Hot coffee', quantity: '1', unit: 'cup' },
      { id: '10', name: 'Butter for frosting', quantity: '1/2', unit: 'cup' },
      { id: '11', name: 'Heavy cream', quantity: '1/4', unit: 'cup' },
    ],
    directions: [
      { id: '1', step: 1, instruction: 'Preheat oven to 350°F (175°C) and grease two 9-inch cake pans', duration: '10 mins', timeValue: 10, timeUnit: 'minutes' },
      { id: '2', step: 2, instruction: 'Mix dry ingredients (flour, cocoa, sugar, baking soda) in large bowl', duration: '5 mins', timeValue: 5, timeUnit: 'minutes' },
      { id: '3', step: 3, instruction: 'Add eggs, buttermilk, oil and vanilla. Beat on medium for 2 minutes', duration: '5 mins', timeValue: 5, timeUnit: 'minutes' },
      { id: '4', step: 4, instruction: 'Stir in hot coffee until batter is smooth', duration: '3 mins', timeValue: 3, timeUnit: 'minutes' },
      { id: '5', step: 5, instruction: 'Pour batter into pans and bake until toothpick comes out clean', duration: '35 mins', timeValue: 35, timeUnit: 'minutes' },
      { id: '6', step: 6, instruction: 'Cool cakes in pans for 10 minutes, then remove to wire rack', duration: '10 mins', timeValue: 10, timeUnit: 'minutes' },
      { id: '7', step: 7, instruction: 'Make frosting: Beat butter, add cocoa and cream until smooth', duration: '10 mins', timeValue: 10, timeUnit: 'minutes' },
      { id: '8', step: 8, instruction: 'Frost cooled cake layers and decorate as desired', duration: '15 mins', timeValue: 15, timeUnit: 'minutes' },
    ],
  },
  {
    title: 'Apple Cider Wine',
    description: 'Homemade apple cider wine with natural fermentation',
    category: 'Beverages',
    servingSize: 15,
    totalTime: '30 days',
    totalTimeValue: 30,
    totalTimeUnit: 'days',
    isFavorite: true,
    ingredients: [
      { id: '1', name: 'Fresh apples', quantity: '8', unit: 'kg' },
      { id: '2', name: 'Sugar', quantity: '1.5', unit: 'kg' },
      { id: '3', name: 'Wine yeast', quantity: '5', unit: 'g' },
      { id: '4', name: 'Water', quantity: '3', unit: 'l' },
      { id: '5', name: 'Lemon juice', quantity: '1/2', unit: 'cup' },
    ],
    directions: [
      { id: '1', step: 1, instruction: 'Wash, core, and chop apples. Extract juice using juicer or press', duration: 'Day 1', timeValue: 1, timeUnit: 'days' },
      { id: '2', step: 2, instruction: 'Mix apple juice with sugar, lemon juice and water in fermentation vessel', duration: 'Day 1', timeValue: 1, timeUnit: 'days' },
      { id: '3', step: 3, instruction: 'Add yeast when mixture is at room temperature, cover with airlock', duration: 'Day 1', timeValue: 1, timeUnit: 'days' },
      { id: '4', step: 4, instruction: 'Monitor fermentation - should see bubbling activity', duration: 'Day 2', timeValue: 2, timeUnit: 'days' },
      { id: '5', step: 5, instruction: 'Check fermentation progress and taste for sweetness', duration: 'Day 7', timeValue: 7, timeUnit: 'days' },
      { id: '6', step: 6, instruction: 'Rack (transfer) to secondary fermentation vessel, leave sediment', duration: 'Day 14', timeValue: 14, timeUnit: 'days' },
      { id: '7', step: 7, instruction: 'Monitor clarity and taste. Wine should be clearing', duration: 'Day 21', timeValue: 21, timeUnit: 'days' },
      { id: '8', step: 8, instruction: 'Bottle the wine when fermentation is complete and wine is clear', duration: 'Day 30', timeValue: 30, timeUnit: 'days' },
    ],
  },
  {
    title: 'Sourdough Bread',
    description: 'Artisan sourdough bread with natural fermentation',
    category: 'Fermented Foods',
    servingSize: 8,
    totalTime: '3 days',
    totalTimeValue: 3,
    totalTimeUnit: 'days',
    isFavorite: false,
    ingredients: [
      { id: '1', name: 'Active sourdough starter', quantity: '1', unit: 'cup' },
      { id: '2', name: 'Bread flour', quantity: '4', unit: 'cups' },
      { id: '3', name: 'Water', quantity: '1.5', unit: 'cups' },
      { id: '4', name: 'Salt', quantity: '2', unit: 'tsp' },
    ],
    directions: [
      { id: '1', step: 1, instruction: 'Feed sourdough starter 8-12 hours before starting', duration: 'Day 1', timeValue: 1, timeUnit: 'days' },
      { id: '2', step: 2, instruction: 'Mix active starter, water and flour. Let rest (autolyse) for 1 hour', duration: 'Day 2', timeValue: 2, timeUnit: 'days' },
      { id: '3', step: 3, instruction: 'Add salt and knead. Perform stretch and folds every 30 mins (4 times)', duration: 'Day 2', timeValue: 2, timeUnit: 'days' },
      { id: '4', step: 4, instruction: 'Bulk fermentation at room temperature until doubled', duration: 'Day 2', timeValue: 2, timeUnit: 'days' },
      { id: '5', step: 5, instruction: 'Shape the dough and place in banneton. Refrigerate overnight', duration: 'Day 2', timeValue: 2, timeUnit: 'days' },
      { id: '6', step: 6, instruction: 'Preheat oven to 450°F with Dutch oven inside', duration: 'Day 3', timeValue: 3, timeUnit: 'days' },
      { id: '7', step: 7, instruction: 'Score the dough and bake covered for 20 mins, then uncovered for 25 mins', duration: 'Day 3', timeValue: 3, timeUnit: 'days' },
      { id: '8', step: 8, instruction: 'Cool on wire rack for at least 1 hour before slicing', duration: 'Day 3', timeValue: 3, timeUnit: 'days' },
    ],
  },
  {
    title: 'New York Cheesecake',
    description: 'Creamy, classic New York style cheesecake with graham cracker crust',
    category: 'Desserts',
    servingSize: 12,
    totalTime: '5 hours',
    totalTimeValue: 5,
    totalTimeUnit: 'hours',
    isFavorite: false,
    ingredients: [
      { id: '1', name: 'Graham crackers (crushed)', quantity: '2', unit: 'cups' },
      { id: '2', name: 'Butter (melted)', quantity: '1/2', unit: 'cup' },
      { id: '3', name: 'Cream cheese (room temp)', quantity: '32', unit: 'oz' },
      { id: '4', name: 'Sugar', quantity: '1.5', unit: 'cups' },
      { id: '5', name: 'Sour cream', quantity: '1', unit: 'cup' },
      { id: '6', name: 'Vanilla extract', quantity: '2', unit: 'tsp' },
      { id: '7', name: 'Eggs', quantity: '4', unit: 'pieces' },
      { id: '8', name: 'Heavy cream', quantity: '1/4', unit: 'cup' },
    ],
    directions: [
      { id: '1', step: 1, instruction: 'Preheat oven to 325°F. Mix graham cracker crumbs with melted butter', duration: '10 mins', timeValue: 10, timeUnit: 'minutes' },
      { id: '2', step: 2, instruction: 'Press crumb mixture into bottom of 9-inch springform pan', duration: '5 mins', timeValue: 5, timeUnit: 'minutes' },
      { id: '3', step: 3, instruction: 'Beat cream cheese until smooth. Add sugar and beat until fluffy', duration: '10 mins', timeValue: 10, timeUnit: 'minutes' },
      { id: '4', step: 4, instruction: 'Add sour cream and vanilla. Mix until combined', duration: '5 mins', timeValue: 5, timeUnit: 'minutes' },
      { id: '5', step: 5, instruction: 'Add eggs one at a time, beating on low speed. Stir in cream', duration: '10 mins', timeValue: 10, timeUnit: 'minutes' },
      { id: '6', step: 6, instruction: 'Pour filling over crust. Bake in water bath until set', duration: '1 hour', timeValue: 1, timeUnit: 'hours' },
      { id: '7', step: 7, instruction: 'Turn off oven and leave cheesecake inside with door cracked', duration: '1 hour', timeValue: 1, timeUnit: 'hours' },
      { id: '8', step: 8, instruction: 'Remove from oven and cool to room temperature', duration: '1 hour', timeValue: 1, timeUnit: 'hours' },
      { id: '9', step: 9, instruction: 'Refrigerate for at least 4 hours or overnight before serving', duration: '1 hour', timeValue: 1, timeUnit: 'hours' },
    ],
  },
];

const mockCategories = [
  { name: 'Appetizers', description: 'Start your meal right' },
  { name: 'Main Course', description: 'Hearty main dishes' },
  { name: 'Desserts', description: 'Sweet endings' },
  { name: 'Beverages', description: 'Drinks and refreshments' },
  { name: 'Fermented Foods', description: 'Probiotic-rich foods' },
];

async function migrateRecipeData() {
  const userId = 'default-user';

  console.log('Starting recipe data migration...');
  console.log(`User ID: ${userId}`);

  try {
    // Create categories first
    console.log('\nCreating categories...');
    for (const category of mockCategories) {
      const categoryData = {
        ...category,
        count: 0,
        userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await db.collection('categories').add(categoryData);
      console.log(`✓ Created category: ${category.name} (${docRef.id})`);
    }

    // Create recipes
    console.log('\nCreating recipes...');
    for (const recipe of mockRecipes) {
      const recipeData = {
        ...recipe,
        userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await db.collection('recipes').add(recipeData);
      console.log(`✓ Created recipe: ${recipe.title} (${docRef.id})`);
    }

    // Update category counts
    console.log('\nUpdating category counts...');
    for (const category of mockCategories) {
      const recipesSnapshot = await db.collection('recipes')
        .where('userId', '==', userId)
        .where('category', '==', category.name)
        .get();

      const count = recipesSnapshot.size;

      const categoriesSnapshot = await db.collection('categories')
        .where('userId', '==', userId)
        .where('name', '==', category.name)
        .get();

      if (!categoriesSnapshot.empty) {
        const categoryDoc = categoriesSnapshot.docs[0];
        await categoryDoc.ref.update({ count });
        console.log(`✓ Updated ${category.name}: ${count} recipes`);
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log(`Created ${mockRecipes.length} recipes and ${mockCategories.length} categories`);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Run migration
migrateRecipeData();
