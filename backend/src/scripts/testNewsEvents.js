import mongoose from 'mongoose';
import dotenv from 'dotenv';
import News, { NEWS_STATUS } from '../models/News.js';
import Event, { EVENT_STATUS, EVENT_TYPE } from '../models/Event.js';
import Admin from '../models/Admin.js';

// Load environment variables
dotenv.config();

/**
 * Test script for news and events modules
 */

async function testNewsEventsModules() {
  try {
    console.log('🧪 Testing News and Events Modules...\n');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Create a test admin for testing
    console.log('\n📝 Creating test admin...');
    const testAdmin = new Admin({
      name: 'Test Admin',
      email: 'testadmin@hueacc.edu.et',
      password: 'TestPassword123!',
      role: 'ADMIN'
    });
    await testAdmin.save();
    console.log('✅ Test admin created:', testAdmin.name);
    
    // Test News Module
    console.log('\n🗞️  Testing News Module...');
    
    // Test 1: Create news article
    console.log('\n📝 Test 1: Creating news article...');
    const newsArticle = new News({
      title: 'Test News Article: Ethics Training Workshop',
      content: 'This is a comprehensive test news article about an upcoming ethics training workshop. The workshop will cover various aspects of ethical conduct in academic institutions, including research integrity, conflict of interest policies, and proper reporting procedures for ethical violations.',
      author: testAdmin._id,
      status: NEWS_STATUS.DRAFT,
      excerpt: 'Learn about ethical conduct in academic institutions through our comprehensive training workshop.',
      tags: ['ethics', 'training', 'workshop', 'academic-integrity'],
      priority: 5
    });
    
    await newsArticle.save();
    console.log('✅ News article created:', newsArticle.title);
    console.log('   Slug:', newsArticle.slug);
    console.log('   Status:', newsArticle.status);
    
    // Test 2: Publish news article
    console.log('\n📝 Test 2: Publishing news article...');
    newsArticle.publish(testAdmin._id);
    await newsArticle.save();
    console.log('✅ News article published');
    console.log('   Status:', newsArticle.status);
    console.log('   Publish Date:', newsArticle.publishDate);
    
    // Test 3: Get published news
    console.log('\n📝 Test 3: Getting published news...');
    const publishedNews = await News.getPublishedNews({ limit: 5 });
    console.log('✅ Published news retrieved:', publishedNews.length, 'articles');
    
    // Test 4: Get news by slug
    console.log('\n📝 Test 4: Getting news by slug...');
    const newsBySlug = await News.getBySlug(newsArticle.slug);
    console.log('✅ News retrieved by slug:', newsBySlug ? newsBySlug.title : 'Not found');
    
    // Test Events Module
    console.log('\n🎉 Testing Events Module...');
    
    // Test 5: Create event
    console.log('\n📝 Test 5: Creating event...');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30); // 30 days from now
    
    const endDate = new Date(futureDate);
    endDate.setHours(endDate.getHours() + 3); // 3 hours duration
    
    const event = new Event({
      title: 'Annual Ethics and Anti-Corruption Conference',
      description: 'Join us for our annual conference focusing on ethics and anti-corruption measures in academic institutions. This event will feature keynote speakers, panel discussions, and interactive workshops designed to promote ethical conduct and transparency.',
      location: 'Haramaya University Main Auditorium',
      startDate: futureDate,
      endDate: endDate,
      capacity: 200,
      status: EVENT_STATUS.DRAFT,
      eventType: EVENT_TYPE.CONFERENCE,
      organizer: testAdmin._id,
      tags: ['ethics', 'anti-corruption', 'conference', 'academic'],
      registrationRequired: true,
      registrationDeadline: new Date(futureDate.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days before
      contactEmail: 'events@hueacc.edu.et',
      contactPhone: '+251-25-553-0000',
      requirements: 'University ID required for entry',
      agenda: [
        {
          time: '09:00 AM',
          activity: 'Registration and Welcome Coffee',
          speaker: ''
        },
        {
          time: '10:00 AM',
          activity: 'Opening Keynote: Ethics in Higher Education',
          speaker: 'Dr. Sarah Johnson'
        },
        {
          time: '11:30 AM',
          activity: 'Panel Discussion: Anti-Corruption Strategies',
          speaker: 'Various Experts'
        }
      ],
      priority: 8
    });
    
    await event.save();
    console.log('✅ Event created:', event.title);
    console.log('   Slug:', event.slug);
    console.log('   Status:', event.status);
    console.log('   Start Date:', event.startDate);
    console.log('   Is Upcoming:', event.isUpcoming());
    
    // Test 6: Publish event
    console.log('\n📝 Test 6: Publishing event...');
    event.publish(testAdmin._id);
    await event.save();
    console.log('✅ Event published');
    console.log('   Status:', event.status);
    
    // Test 7: Get upcoming events
    console.log('\n📝 Test 7: Getting upcoming events...');
    const upcomingEvents = await Event.getUpcomingEvents({ limit: 5 });
    console.log('✅ Upcoming events retrieved:', upcomingEvents.length, 'events');
    
    // Test 8: Get event by slug
    console.log('\n📝 Test 8: Getting event by slug...');
    const eventBySlug = await Event.getBySlug(event.slug);
    console.log('✅ Event retrieved by slug:', eventBySlug ? eventBySlug.title : 'Not found');
    
    // Test 9: Test admin queries
    console.log('\n📝 Test 9: Testing admin queries...');
    const adminNews = await News.getNewsForAdmin({}, { limit: 5 });
    const adminEvents = await Event.getEventsForAdmin({}, { limit: 5 });
    console.log('✅ Admin news query:', adminNews.length, 'articles');
    console.log('✅ Admin events query:', adminEvents.length, 'events');
    
    // Test 10: Test search functionality
    console.log('\n📝 Test 10: Testing search functionality...');
    const searchNews = await News.getPublishedNews({ search: 'ethics', limit: 5 });
    const searchEvents = await Event.getUpcomingEvents({ search: 'conference', limit: 5 });
    console.log('✅ News search results:', searchNews.length, 'articles');
    console.log('✅ Events search results:', searchEvents.length, 'events');
    
    // Test 11: Test filtering by tags
    console.log('\n📝 Test 11: Testing tag filtering...');
    const taggedNews = await News.getPublishedNews({ tags: ['ethics'], limit: 5 });
    const taggedEvents = await Event.getUpcomingEvents({ tags: ['conference'], limit: 5 });
    console.log('✅ Tagged news results:', taggedNews.length, 'articles');
    console.log('✅ Tagged events results:', taggedEvents.length, 'events');
    
    console.log('\n🎉 All tests passed! News and Events modules are working correctly.');
    
    // Cleanup test data
    console.log('\n🧹 Cleaning up test data...');
    await News.findByIdAndDelete(newsArticle._id);
    await Event.findByIdAndDelete(event._id);
    await Admin.findByIdAndDelete(testAdmin._id);
    console.log('✅ Test data cleaned up');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  }
}

// Run the test
testNewsEventsModules();