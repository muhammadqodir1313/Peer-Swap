'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import { formatRelativeTime } from '@/lib/utils';

export default function MessagesPage() {
  // Fetch conversations
  const { data: conversationsData, isLoading } = useQuery({
    queryKey: ['messages', 'conversations'],
    queryFn: () => api.messages.getConversations(),
  });

  const conversations = (conversationsData as any)?.data || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-muted-foreground mt-1">
          Chat with your learning partners
        </p>
      </div>

      {/* Conversations List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading conversations...</p>
            </div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12 px-6">
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No conversations yet
            </h2>
            <p className="text-gray-600 mb-4">
              Connect with users and start messaging
            </p>
            <Link
              href="/matches"
              className="inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
            >
              Find Matches
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {conversations.map((conversation: any) => (
              <Link
                key={conversation.user.id}
                href={`/messages/${conversation.user.id}`}
                className={`flex items-center gap-4 p-4 hover:bg-gray-50 transition ${
                  conversation.unread_count > 0 ? 'bg-blue-50' : ''
                }`}
              >
                {/* Avatar */}
                {conversation.user.avatar_url ? (
                  <img
                    src={conversation.user.avatar_url}
                    alt={conversation.user.name}
                    className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                    {conversation.user.name.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {conversation.user.name}
                    </h3>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {formatRelativeTime(conversation.last_message.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p
                      className={`text-sm truncate ${
                        conversation.unread_count > 0
                          ? 'font-medium text-gray-900'
                          : 'text-gray-600'
                      }`}
                    >
                      {conversation.last_message.content}
                    </p>
                    {conversation.unread_count > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-primary text-white text-xs font-medium rounded-full flex-shrink-0">
                        {conversation.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
