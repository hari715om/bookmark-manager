import BookmarkItem from './BookmarkItem';

export default function BookmarkList({ bookmarks, onEdit, onDelete, onTagClick, activeTag }) {
    if (bookmarks.length === 0) {
        return (
            <div className="empty-state">
                <p>No bookmarks found</p>
                <p>Add your first bookmark above or adjust your search/filter.</p>
            </div>
        );
    }

    return (
        <div className="bookmark-list">
            {bookmarks.map((bookmark) => (
                <BookmarkItem
                    key={bookmark.id}
                    bookmark={bookmark}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onTagClick={onTagClick}
                    activeTag={activeTag}
                />
            ))}
        </div>
    );
}
