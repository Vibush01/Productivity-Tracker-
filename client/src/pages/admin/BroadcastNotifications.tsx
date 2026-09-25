import React, { useState } from 'react';
import api from '../../services/api';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import { useUIStore } from '../../store/uiStore';

const BroadcastNotifications: React.FC = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [segment, setSegment] = useState('all');
  const [isSending, setIsSending] = useState(false);
  const { addToast } = useUIStore();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;

    if (!window.confirm(`Send this push notification to ${segment} users?`)) return;

    setIsSending(true);
    try {
      const { data } = await api.post('/admin/broadcast', { title, body, segment });
      addToast(data.message || 'Broadcast sent successfully', 'success');
      setTitle('');
      setBody('');
    } catch (error: any) {
      addToast(error.response?.data?.error || 'Failed to send broadcast', 'error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold">Broadcast Notifications</h1>
      
      <Card className="p-6">
        <form onSubmit={handleSend} className="space-y-4">
          <Input 
            label="Notification Title" 
            placeholder="e.g. New Feature Alert!" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-text-secondary">Message Body</label>
            <textarea
              className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-neon transition-colors resize-none"
              rows={4}
              placeholder="Enter the push notification message..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-text-secondary">Target Segment</label>
            <select
              value={segment}
              onChange={(e) => setSegment(e.target.value)}
              className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-neon appearance-none"
            >
              <option value="all">All Users</option>
              <option value="premium">Premium Users Only</option>
              <option value="free">Free Users Only</option>
            </select>
          </div>

          <Button type="submit" variant="primary" className="w-full mt-4" disabled={isSending}>
            {isSending ? 'Sending...' : 'Send Broadcast'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default BroadcastNotifications;
