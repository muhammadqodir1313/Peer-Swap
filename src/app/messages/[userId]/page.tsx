'use client';

import { useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { MessageBubble } from '@/components/messages/MessageBubble';
import { MessageInput } from '@/components/messages/MessageInput';
import Link from 'next/link';

export default function ChatWindowPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = params.userId as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversation
  const { data: messagesData, isLoading } = useQuery({
    queryKey: ['messages', 'conversation', userId],
    queryFn: () => api.messages.getConversation(userId),
    refetchInterval: 5000, // Poll every 5 seconds for new messages
  });

  // Fetch user info
  const { data: userData } = useQuery({
    queryKey: ['users', userId],
    queryFn: () => api.users.getById(userId),
  });

  const messages = (messagesData as any)?.data?.messages || [];
  const otherUser = (userData as any)?.data;

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: (content: string) =>
      api.messages.send({ recipient_id: userId, content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', 'conversation', userId] });
      queryClient.invalidateQueries({ queryKey: ['messages', 'conversations'] });
    },
  });

  // Mark messages as read
  useEffect(() => {
    if (messages.length > 0) {
      const unreadMessages = messages.filter(
        (msg: any) => !msg.is_read && msg.sender_id === userId
      );
      unreadMessages.forEach((msg: any) => {
        api.messages.markAsRead(msg.id);
      });
    }
  }, [messages, userId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (content: string) => {
    sendMutation.mutate(content);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-gray-50">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {otherUser?.avatar_url ? (
              <img
                src={otherUser.avatar_url}
                alt={otherUser.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                {otherUser?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div>
              <Link
                href={`/profile/${userId}`}
                className="font-semibold text-gray-900 hover:text-primary"
              >
                {otherUser?.name || 'User'}
              </Link>
              {otherUser?.bio && (
                <p className="text-sm text-gray-600 line-clamp-1">{otherUser.bio}</p>
              )}
            </div>
          </div>
          <Link
            href="/messages"
            className="text-primary hover:underline text-sm"
          >
            Back to Messages
          </Link>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👋</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Start a conversation
            </h2>
            <p className="text-gray-600">
              Send a message to {otherUser?.name || 'this user'}
            </p>
          </div>
        ) : (
          <>
            {messages.map((message: any) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwnMessage={message.sender_id === user?.id}
                senderName={message.sender_id !== user?.id ? otherUser?.name : undefined}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <MessageInput onSend={handleSendMessage} disabled={sendMutation.isPending} />
    </div>
  );
}
