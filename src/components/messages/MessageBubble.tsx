'use client';

import { formatRelativeTime } from '@/lib/utils';

interface MessageBubbleProps {
  message: {
    id: string | number;
    content: string;
    created_at: string;
    is_read: boolean;
    sender_id: string;
  };
  isOwnMessage: boolean;
  senderName?: string;
}

export function MessageBubble({ message, isOwnMessage, senderName }: MessageBubbleProps) {
  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
        {!isOwnMessage && senderName && (
          <p className="text-xs text-gray-500 mb-1 px-3">{senderName}</p>
        )}
        <div
          className={`px-4 py-2 rounded-2xl ${
            isOwnMessage
              ? 'bg-primary text-white rounded-tr-sm'
              : 'bg-gray-100 text-gray-900 rounded-tl-sm'
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        <div className="flex items-center gap-2 mt-1 px-3">
          <p className="text-xs text-gray-500">{formatRelativeTime(message.created_at)}</p>
          {isOwnMessage && (
            <span className="text-xs text-gray-500">
              {message.is_read ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
