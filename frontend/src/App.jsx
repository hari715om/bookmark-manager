import { useState, useEffect, useMemo } from 'react';
import { fetchBookmarks, createBookmark, updateBookmark, deleteBookmark } from './api';
import BookmarkForm from './components/BookmarkForm';
import BookmarkList from './components/BookmarkList';
import ConfirmDialog from './components/ConfirmDialog';

export default function App() {
    const [bookmarks, setBookmarks] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTag, setActiveTag] = useState('');
    const [editingBookmark, setEditingBookmark] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        loadBookmarks();
    }, [activeTag]);

    async function loadBookmarks() {
        try {
            setLoading(true);
            const data = await fetchBookmarks(activeTag);
            setBookmarks(data);
            setError('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const filteredBookmarks = useMemo(() => {
        if (!searchQuery.trim()) return bookmarks;
        const query = searchQuery.toLowerCase();
        return bookmarks.filter(
            (b) =>
                b.title.toLowerCase().includes(query) ||
                b.url.toLowerCase().includes(query)
        );
    }, [bookmarks, searchQuery]);

    async function handleAddBookmark(data) {
        const result = await createBookmark(data);
        setSuccess('Bookmark added successfully!');
        setTimeout(() => setSuccess(''), 3000);
        await loadBookmarks();
        return result;
    }

    async function handleUpdateBookmark(data) {
        const result = await updateBookmark(editingBookmark.id, data);
        setEditingBookmark(null);
        setSuccess('Bookmark updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
        await loadBookmarks();
        return result;
    }

    async function handleConfirmDelete() {
        try {
            await deleteBookmark(deleteTarget.id);
            setDeleteTarget(null);
            setSuccess('Bookmark deleted successfully!');
            setTimeout(() => setSuccess(''), 3000);
            await loadBookmarks();
        } catch (err) {
            setError(err.message);
            setDeleteTarget(null);
        }
    }

    function handleTagClick(tag) {
        setActiveTag((prev) => (prev === tag ? '' : tag));
        setSearchQuery('');
    }

    function toggleTheme() {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    }

    return (
        <div className="app">
            <header className="header">
                <h1>📑 Bookmark Manager</h1>
                <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
                    {theme === 'light' ? '🌙' : '☀️'}
                </button>
            </header>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <BookmarkForm
                onSubmit={editingBookmark ? handleUpdateBookmark : handleAddBookmark}
                editingBookmark={editingBookmark}
                onCancelEdit={() => setEditingBookmark(null)}
            />

            <div className="toolbar">
                <input
                    className="search-input"
                    type="text"
                    placeholder="Search bookmarks by title or URL..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                {activeTag && (
                    <div className="active-filter">
                        Filtered by: <strong>{activeTag}</strong>
                        <button onClick={() => setActiveTag('')} title="Clear filter">
                            ✕
                        </button>
                    </div>
                )}
            </div>

            <div className="bookmark-count">
                {loading ? 'Loading...' : `${filteredBookmarks.length} bookmark${filteredBookmarks.length !== 1 ? 's' : ''}`}
            </div>

            <BookmarkList
                bookmarks={filteredBookmarks}
                onEdit={setEditingBookmark}
                onDelete={setDeleteTarget}
                onTagClick={handleTagClick}
                activeTag={activeTag}
            />

            {deleteTarget && (
                <ConfirmDialog
                    message={`Are you sure you want to delete "${deleteTarget.title}"?`}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </div>
    );
}
