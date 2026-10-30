/**
 * PathForge AI Tutor Controller
 * Handles contextual mentor chats, preserves conversation history,
 * and passes current learning context (weak topics, active week) to the LLM.
 */

import AIConversation from '../models/AIConversation.js';
import UserProfile from '../models/UserProfile.js';
import WeeklyQuiz from '../models/WeeklyQuiz.js';
import PersonalizedRoadmap from '../models/PersonalizedRoadmap.js';
import { getTutorResponse } from '../services/aiTutorService.js';

export const sendMessage = async (req, res) => {
  const userId = req.user._id;
  const { message, topic = '', weekNumber = null, skill = '' } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Message content is required' });
  }

  // Fetch student context
  const [profile, roadmap, latestQuiz] = await Promise.all([
    UserProfile.findOne({ userId }),
    PersonalizedRoadmap.findOne({ userId }).sort({ createdAt: -1 }),
    WeeklyQuiz.findOne({ userId, isCompleted: true }).sort({ weekNumber: -1 })
  ]);

  const targetRole = profile?.targetRole || roadmap?.targetRole || 'Full Stack Developer';
  const weakTopics = latestQuiz?.attempts?.slice(-1)[0]?.weakTopics || [];
  const recentQuizScore = latestQuiz?.latestScore ?? null;

  // Retrieve or create conversation
  let conversation = await AIConversation.findOne({ userId });
  if (!conversation) {
    conversation = await AIConversation.create({
      userId,
      title: `${targetRole} Mentorship`,
      messages: []
    });
  }

  // Append user message
  const userMsgRecord = {
    role: 'user',
    content: message.trim(),
    context: {
      topic: topic || '',
      weekNumber: weekNumber || null,
      skill: skill || ''
    },
    timestamp: new Date()
  };
  conversation.messages.push(userMsgRecord);

  // Generate response
  const assistantReply = await getTutorResponse({
    userMessage: message.trim(),
    currentTopic: topic,
    currentWeek: weekNumber || 1,
    targetRole,
    weakTopics,
    recentQuizScore,
    chatHistory: conversation.messages.slice(-8)
  });

  const assistantMsgRecord = {
    role: 'assistant',
    content: assistantReply,
    context: {
      topic: topic || '',
      weekNumber: weekNumber || null,
      skill: skill || ''
    },
    timestamp: new Date()
  };
  conversation.messages.push(assistantMsgRecord);

  await conversation.save();

  return res.status(200).json({
    success: true,
    data: {
      reply: assistantReply,
      message: assistantMsgRecord,
      totalMessages: conversation.messages.length
    }
  });
};

export const getConversation = async (req, res) => {
  const userId = req.user._id;
  let conversation = await AIConversation.findOne({ userId });

  if (!conversation) {
    conversation = await AIConversation.create({
      userId,
      title: 'AI Mentorship',
      messages: [
        {
          role: 'assistant',
          content: 'Hello! I am your PathForge AI Mentor. Ask me any conceptual question, request coding challenges, or ask why your roadmap adapted after your quiz!',
          context: {},
          timestamp: new Date()
        }
      ]
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      conversationId: conversation._id,
      title: conversation.title,
      messages: conversation.messages
    }
  });
};

export const clearConversation = async (req, res) => {
  const userId = req.user._id;
  await AIConversation.findOneAndUpdate(
    { userId },
    {
      $set: {
        messages: [
          {
            role: 'assistant',
            content: 'Hello! I am your PathForge AI Mentor. How can I assist your learning today?',
            context: {},
            timestamp: new Date()
          }
        ]
      }
    },
    { upsert: true }
  );

  return res.status(200).json({
    success: true,
    message: 'Conversation cleared'
  });
};

export default {
  sendMessage,
  getConversation,
  clearConversation
};
