import { useState, useEffect } from 'react';

const EMPTY_FORM = { url: '', title: '', description: '', tags: '' };

function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

export default function BookmarkForm({ onSubmit, editingBookmark, onCancelEdit }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [error, setError] = useState('');

    useEffect(() => {
        if (editingBookmark) {
            setForm({
                url: editingBookmark.url,
                title: editingBookmark.title,
                description: editingBookmark.description || '',
                tags: editingBookmark.tags ? editingBookmark.tags.join(', ') : '',
            });
            setError('');
        } else {
            setForm(EMPTY_FORM);
        }
    }, [editingBookmark]);

    function validate() {
        if (!form.url.trim()) return 'URL is required';
        if (!isValidUrl(form.url.trim())) return 'Please enter a valid URL (e.g. https://example.com)';
        if (!form.title.trim()) return 'Title is required';
        if (form.title.trim().length > 200) return 'Title must be 200 characters or less';
        if (form.description.length > 500) return 'Description must be 500 characters or less';

        const tags = parseTags(form.tags);
        if (tags.length > 5) return 'Maximum 5 tags allowed';

        return null;
    }

    function parseTags(tagString) {
        if (!tagString.trim()) return [];
        return tagString
            .split(',')
            .map((t) => t.trim().toLowerCase())
            .filter((t) => t.length > 0);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        const bookmarkData = {
            url: form.url.trim(),
            title: form.title.trim(),
            description: form.description.trim(),
            tags: parseTags(form.tags),
        };

        try {
            await onSubmit(bookmarkData);
            if (!editingBookmark) {
                setForm(EMPTY_FORM);
            }
        } catch (err) {
            setError(err.message);
        }
    }

    function handleChange(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (error) setError('');
    }

    function handleCancel() {
        setForm(EMPTY_FORM);
        setError('');
        onCancelEdit();
    }

    return (
        <div className="form-container">
            <h2>{editingBookmark ? 'Edit Bookmark' : 'Add New Bookmark'}</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="url">URL *</label>
                        <input
                            id="url"
                            type="text"
                            placeholder="https://example.com"
                            value={form.url}
                            onChange={(e) => handleChange('url', e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="title">Title *</label>
                        <input
                            id="title"
                            type="text"
                            placeholder="Website title"
                            value={form.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            maxLength={200}
                        />
                    </div>
                    <div className="form-group full-width">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            placeholder="Brief description (optional)"
                            value={form.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            rows={2}
                            maxLength={500}
                        />
                    </div>
                    <div className="form-group full-width">
                        <label htmlFor="tags">Tags (comma-separated, max 5)</label>
                        <input
                            id="tags"
                            type="text"
                            placeholder="e.g. javascript, react, frontend"
                            value={form.tags}
                            onChange={(e) => handleChange('tags', e.target.value)}
                        />
                    </div>
                </div>
                <div className="form-actions">
                    <button type="submit" className="btn btn-primary">
                        {editingBookmark ? 'Update Bookmark' : 'Add Bookmark'}
                    </button>
                    {editingBookmark && (
                        <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
