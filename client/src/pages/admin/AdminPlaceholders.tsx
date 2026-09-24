import React from 'react';

const PlaceholderAdminPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      <p className="text-text-secondary">This feature is currently under development.</p>
    </div>
  </div>
);

export const ContentManager = () => <PlaceholderAdminPage title="Content Manager" />;
export const ProgramBuilder = () => <PlaceholderAdminPage title="Program Builder" />;
export const ErrorLogs = () => <PlaceholderAdminPage title="Error Log Viewer" />;
export const FeedbackInbox = () => <PlaceholderAdminPage title="Feedback Inbox" />;
export const FeatureFlags = () => <PlaceholderAdminPage title="Feature Flags" />;
