import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import Button from '../../common/Button';
import Card from '../../common/Card';

interface Template {
  _id: string;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
}

const TemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Template Manager</h1>
        <Button onClick={() => alert('Create modal coming soon')}>
          <span className="material-icons text-sm mr-2">add</span>
          New Template
        </Button>
      </div>
      
      {isLoading ? (
        <div>Loading templates...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(template => (
            <Card key={template._id} className="p-4 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold">{template.name}</h3>
                <p className="text-text-secondary text-sm mb-2">{template.category}</p>
                <p className="text-text-tertiary">{template.description}</p>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" className="flex-1" onClick={() => alert('Edit modal coming soon')}>Edit</Button>
                <Button variant="danger" className="flex-1" onClick={() => deleteTemplate(template._id)}>Delete</Button>
              </div>
            </Card>
          ))}
          {templates.length === 0 && <p>No templates found.</p>}
        </div>
      )}
    </div>
  );
};

export default TemplateManager;
