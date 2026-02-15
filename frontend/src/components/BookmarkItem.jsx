export default function BookmarkItem({ bookmark, onEdit, onDelete, onTagClick, activeTag }) {
    const snippet =
        bookmark.description && bookmark.description.length > 100
            ? bookmark.description.slice(0, 100) + '…'
            : bookmark.description || '';

    const createdDate = new Date(bookmark.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    return (
        <div className="bookmark-card">
            <div className="bookmark-header">
                <h3 className="bookmark-title">{bookmark.title}</h3>
                <div className="bookmark-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => onEdit(bookmark)}>
                        ✏️ Edit
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => onDelete(bookmark)}>
                        🗑️ Delete
                    </button>
                </div>
            </div>
            <a
                className="bookmark-url"
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
            >
                {bookmark.url}
            </a>
            {snippet && <p className="bookmark-description">{snippet}</p>}
            {bookmark.tags && bookmark.tags.length > 0 && (
                <div className="bookmark-tags">
                    {bookmark.tags.map((tag) => (
                        <span
                            key={tag}
                            className={`tag ${activeTag === tag ? 'active' : ''}`}
                            onClick={() => onTagClick(tag)}
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}
            <div className="bookmark-meta">Added {createdDate}</div>
        </div>
    );
}
