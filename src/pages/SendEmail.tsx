import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Paperclip, Send, Trash2 } from 'lucide-react';

const SendEmail: React.FC = () => {
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    message: '',
    files: [] as File[],
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({
        ...formData,
        files: [...formData.files, ...Array.from(e.target.files)],
      });
    }
  };

  const removeFile = (index: number) => {
    setFormData({
      ...formData,
      files: formData.files.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement email sending logic
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="flex items-center gap-3 mb-8">
        <Mail className="w-8 h-8 text-primary-500" />
        <h1 className="text-3xl font-bold text-gray-800">Send Email</h1>
      </div>

      <div className="card p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To
            </label>
            <input
              type="email"
              className="input"
              placeholder="recipient@example.com"
              value={formData.to}
              onChange={(e) => setFormData({ ...formData, to: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <input
              type="text"
              className="input"
              placeholder="Email subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              className="input min-h-[200px]"
              placeholder="Write your message here..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachments
            </label>
            <div className="space-y-4">
              <label className="block">
                <span className="btn btn-secondary flex items-center gap-2 cursor-pointer">
                  <Paperclip className="w-5 h-5" />
                  Add Attachments
                </span>
                <input
                  type="file"
                  className="hidden"
                  multiple
                  onChange={handleFileChange}
                />
              </label>
              {formData.files.length > 0 && (
                <div className="space-y-2">
                  {formData.files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                    >
                      <span className="text-sm text-gray-600">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="btn btn-primary flex items-center gap-2">
              <Send className="w-5 h-5" />
              Send Email
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default SendEmail;