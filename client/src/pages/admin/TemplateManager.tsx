import React, { useState, useEffect } from 'react';
import { LayoutTemplate, Plus, Trash2, Edit3 } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Button from '../../components/common/Button';
import { useUIStore } from '../../store/uiStore';
import api from '../../services/api';

interface Template {
  _id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  isActive: boolean;
}

const TemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useUIStore();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data } = await api.get('/admin/templates');
      setTemplates(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!window.confirm('Delete this template?')) return;
    try {
      await api.delete(`/admin/templates/${id}`);
      setTemplates(templates.filter(t => t._id !== id));
      showToast('success', 'Template deleted');
    } catch (error) {
      showToast('error', 'Failed to delete template');
    }
  };

  return (
    <>
      <Navbar />
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">📋 Template Manager</h2>
          <Button size="sm" onClick={() => showToast('info', 'Create template modal coming soon')} icon={<Plus size={16} />}>
            New Template
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-[3px] border-bg-tertiary border-t-neon rounded-full animate-spin" />
          </div>
        ) : templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <LayoutTemplate size={48} className="text-text-tertiary" />
            <p className="text-text-secondary">No templates yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => (
              <div key={template._id} className="bg-bg-secondary border border-border rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{template.icon || '📌'}</span>
                    <h3 className="text-lg font-bold">{template.name}</h3>
                  </div>
                  <span className="inline-block text-xs bg-bg-tertiary text-text-secondary px-2 py-1 rounded-lg mb-2">{template.category}</span>
                  <p className="text-sm text-text-tertiary">{template.description || 'No description'}</p>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => showToast('info', 'Edit modal coming soon')} icon={<Edit3 size={14} />}>
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" className="flex-1" onClick={() => deleteTemplate(template._id)} icon={<Trash2 size={14} />}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default TemplateManager;
