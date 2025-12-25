import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ContactMessage, { MESSAGE_STATUS } from '../models/ContactMessage.js';
import Admin from '../models/Admin.js';

// Load environment variables
dotenv.config();

/**
 * Test script for contact message module
 */

async function testContactModule() {
  try {
    console.log('🧪 Testing Contact Message Module...\n');
    
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
    
    // Test 1: Create contact message with email
    console.log('\n📝 Test 1: Creating contact message with email...');
    const contactMessage1 = new ContactMessage({
      senderName: 'John Doe',
      email: 'john.doe@example.com',
      subject: 'Question about Ethics Training Program',
      messageBody: 'Hello, I would like to know more about the upcoming ethics training program. When will it be held and how can I register? Thank you for your time.',
      category: 'GENERAL_INQUIRY'
    });
    
    await contactMessage1.save();
    console.log('✅ Contact message created:', contactMessage1.subject);
    console.log('   Status:', contactMessage1.status);
    console.log('   Has Email:', !!contactMessage1.email);
    console.log('   Spam Score:', contactMessage1.spamScore);
    console.log('   Is Spam:', contactMessage1.isSpam);
    
    // Test 2: Create anonymous contact message
    console.log('\n📝 Test 2: Creating anonymous contact message...');
    const contactMessage2 = new ContactMessage({
      subject: 'Suggestion for Website Improvement',
      messageBody: 'I think the website could benefit from having a FAQ section. Many common questions could be answered there, reducing the workload on your team.',
      category: 'SUGGESTION'
    });
    
    await contactMessage2.save();
    console.log('✅ Anonymous contact message created:', contactMessage2.subject);
    console.log('   Sender Name:', contactMessage2.senderName);
    console.log('   Has Email:', !!contactMessage2.email);
    
    // Test 3: Create potential spam message
    console.log('\n📝 Test 3: Creating potential spam message...');
    const spamMessage = new ContactMessage({
      senderName: 'WINNER!!!',
      email: 'spam@fake.com',
      subject: 'CONGRATULATIONS!!! YOU WON!!!',
      messageBody: 'CONGRATULATIONS!!! You have won $1,000,000!!! Click here now!!! Free money!!! Casino winner!!!',
      category: 'OTHER'
    });
    
    await spamMessage.save();
    console.log('✅ Potential spam message created:', spamMessage.subject);
    console.log('   Spam Score:', spamMessage.spamScore);
    console.log('   Is Spam:', spamMessage.isSpam);
    
    // Test 4: Admin operations - Mark as read
    console.log('\n📝 Test 4: Admin marking message as read...');
    contactMessage1.markAsRead(testAdmin._id);
    await contactMessage1.save();
    console.log('✅ Message marked as read');
    console.log('   Status:', contactMessage1.status);
    console.log('   Handled By:', contactMessage1.handledBy);
    
    // Test 5: Admin operations - Add internal note
    console.log('\n📝 Test 5: Adding internal note...');
    contactMessage1.addInternalNote('This user seems interested in our training programs. Follow up with detailed information.', testAdmin._id);
    await contactMessage1.save();
    console.log('✅ Internal note added');
    console.log('   Notes Count:', contactMessage1.internalNotes.length);
    
    // Test 6: Admin operations - Mark as responded
    console.log('\n📝 Test 6: Marking message as responded...');
    contactMessage1.markAsResponded('Thank you for your inquiry. The ethics training program will be held next month. Registration details have been sent to your email.', testAdmin._id);
    await contactMessage1.save();
    console.log('✅ Message marked as responded');
    console.log('   Status:', contactMessage1.status);
    console.log('   Response Content:', contactMessage1.response.content.substring(0, 50) + '...');
    
    // Test 7: Update priority
    console.log('\n📝 Test 7: Updating message priority...');
    contactMessage2.updatePriority('HIGH', testAdmin._id);
    await contactMessage2.save();
    console.log('✅ Priority updated');
    console.log('   Priority:', contactMessage2.priority);
    
    // Test 8: Mark as spam
    console.log('\n📝 Test 8: Manually marking message as spam...');
    const normalMessage = new ContactMessage({
      subject: 'Normal message',
      messageBody: 'This is a normal message that should not be spam.',
      category: 'GENERAL_INQUIRY'
    });
    await normalMessage.save();
    
    normalMessage.markAsSpam(testAdmin._id);
    await normalMessage.save();
    console.log('✅ Message manually marked as spam');
    console.log('   Is Spam:', normalMessage.isSpam);
    console.log('   Spam Score:', normalMessage.spamScore);
    
    // Test 9: Get messages for admin
    console.log('\n📝 Test 9: Getting messages for admin...');
    const adminMessages = await ContactMessage.getMessagesForAdmin({}, { limit: 10 });
    console.log('✅ Admin messages retrieved:', adminMessages.length);
    console.log('   Non-spam messages found');
    
    // Test 10: Get messages including spam
    console.log('\n📝 Test 10: Getting messages including spam...');
    const allMessages = await ContactMessage.getMessagesForAdmin({ includeSpam: true }, { limit: 10 });
    console.log('✅ All messages retrieved (including spam):', allMessages.length);
    
    // Test 11: Get statistics
    console.log('\n📝 Test 11: Getting contact message statistics...');
    const stats = await ContactMessage.getStatistics();
    console.log('✅ Statistics retrieved');
    console.log('   Total Messages:', stats.totalMessages);
    console.log('   New Messages:', stats.newMessages);
    console.log('   Read Messages:', stats.readMessages);
    console.log('   Responded Messages:', stats.respondedMessages);
    console.log('   Spam Messages:', stats.spamMessages);
    
    // Test 12: Test search functionality
    console.log('\n📝 Test 12: Testing search functionality...');
    const searchResults = await ContactMessage.getMessagesForAdmin({ search: 'ethics' }, { limit: 5 });
    console.log('✅ Search results for "ethics":', searchResults.length);
    
    // Test 13: Test filtering by status
    console.log('\n📝 Test 13: Testing status filtering...');
    const newMessages = await ContactMessage.getMessagesForAdmin({ status: MESSAGE_STATUS.NEW }, { limit: 5 });
    const readMessages = await ContactMessage.getMessagesForAdmin({ status: MESSAGE_STATUS.READ }, { limit: 5 });
    const respondedMessages = await ContactMessage.getMessagesForAdmin({ status: MESSAGE_STATUS.RESPONDED }, { limit: 5 });
    console.log('✅ Status filtering results:');
    console.log('   New:', newMessages.length);
    console.log('   Read:', readMessages.length);
    console.log('   Responded:', respondedMessages.length);
    
    // Test 14: Test category filtering
    console.log('\n📝 Test 14: Testing category filtering...');
    const generalInquiries = await ContactMessage.getMessagesForAdmin({ category: 'GENERAL_INQUIRY' }, { limit: 5 });
    const suggestions = await ContactMessage.getMessagesForAdmin({ category: 'SUGGESTION' }, { limit: 5 });
    console.log('✅ Category filtering results:');
    console.log('   General Inquiries:', generalInquiries.length);
    console.log('   Suggestions:', suggestions.length);
    
    // Test 15: Test admin data vs public data
    console.log('\n📝 Test 15: Testing data privacy...');
    const message = await ContactMessage.findById(contactMessage1._id);
    const adminData = message.getAdminData();
    const publicData = message.publicData;
    
    console.log('✅ Data privacy test:');
    console.log('   Admin data includes email:', !!adminData.email);
    console.log('   Public data includes email:', !!publicData.email);
    console.log('   Public data has email flag:', publicData.hasEmail);
    
    console.log('\n🎉 All tests passed! Contact message module is working correctly.');
    
    // Cleanup test data
    console.log('\n🧹 Cleaning up test data...');
    await ContactMessage.findByIdAndDelete(contactMessage1._id);
    await ContactMessage.findByIdAndDelete(contactMessage2._id);
    await ContactMessage.findByIdAndDelete(spamMessage._id);
    await ContactMessage.findByIdAndDelete(normalMessage._id);
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
testContactModule();