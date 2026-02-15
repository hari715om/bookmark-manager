import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchMetadata } from '../api';

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
    const [fetchingTitle, setFetchingTitle] = useState(false);
    const formRef = useRef(null);
    const fetchTimeoutRef = useRef(null);

    useEffect(() => {
        if (editingBookmark) {
            setForm({
                url: editingBookmark.url,
                title: editingBookmark.title,
                description: editingBookmark.description || '',
                tags: editingBookmark.tags ? editingBookmark.tags.join(', ') : '',
            });
            setError('');
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            setForm(EMPTY_FORM);
        }
    }, [editingBookmark]);

    const autoFetchTitle = useCallback(async (url) => {
        if (!isValidUrl(url) || editingBookmark) return;
        setFetchingTitle(true);
        try {
            const data = await fetchMetadata(url);
            if (data.title) {
                setForm((prev) => {
                    if (!prev.title || prev.title === '') {
                        return { ...prev, title: data.title };
                    }
                    return prev;
                });
            }
        } catch {
            // silently ignore fetch failures
        } finally {
            setFetchingTitle(false);
        }
    }, [editingBookmark]);

    function handleUrlBlur() {
        const url = form.url.trim();
        if (url && isValidUrl(url) && !form.title && !editingBookmark) {
            if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
            fetchTimeoutRef.current = setTimeout(() => autoFetchTitle(url), 300);
        }
    }

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
        <div className="form-container" ref={formRef} id="bookmark-form">
            <h2>{editingBookmark ? 'Edit Bookmark' : 'Add New Bookmark'}</h2>
            {error && <div className="error-message" role="alert">{error}</div>}
            <form onSubmit={handleSubmit} noValidate>
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="bookmark-url">URL *</label>
                        <input
                            id="bookmark-url"
                            type="url"
                            placeholder="https://example.com"
                            value={form.url}
                            onChange={(e) => handleChange('url', e.target.value)}
                            onBlur={handleUrlBlur}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="bookmark-title">
                            Title * {fetchingTitle && <span className="fetching-hint">(fetching...)</span>}
                        </label>
                        <input
                            id="bookmark-title"
                            type="text"
                            placeholder={fetchingTitle ? 'Fetching title...' : 'Website title'}
                            value={form.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            maxLength={200}
                        />
                    </div>
                    <div className="form-group full-width">
                        <label htmlFor="bookmark-description">Description</label>
                        <textarea
                            id="bookmark-description"
                            placeholder="Brief description (optional)"
                            value={form.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            rows={2}
                            maxLength={500}
                        />
                    </div>
                    <div className="form-group full-width">
                        <label htmlFor="bookmark-tags">Tags (comma-separated, max 5)</label>
                        <input
                            id="bookmark-tags"
                            type="text"
                            placeholder="e.g. javascript, react, frontend"
                            value={form.tags}
                            onChange={(e) => handleChange('tags', e.target.value)}
                        />
                    </div>
                </div>
                <div className="form-actions">
                    <button type="submit" id="submit-bookmark" className="btn btn-primary">
                        {editingBookmark ? 'Update Bookmark' : 'Add Bookmark'}
                    </button>
                    {editingBookmark && (
                        <button type="button" id="cancel-edit" className="btn btn-secondary" onClick={handleCancel}>
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
