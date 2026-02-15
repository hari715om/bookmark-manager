const API_BASE = '/bookmarks';

async function handleResponse(res) {
    if (res.status === 204) return null;

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || `Request failed with status ${res.status}`);
    }

    return data;
}

export async function fetchBookmarks(tag = '') {
    const url = tag ? `${API_BASE}?tag=${encodeURIComponent(tag)}` : API_BASE;
    const res = await fetch(url);
    return handleResponse(res);
}

export async function createBookmark(bookmark) {
    const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookmark),
    });
    return handleResponse(res);
}

export async function updateBookmark(id, updates) {
    const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });
    return handleResponse(res);
}

export async function deleteBookmark(id) {
    const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
    });
    return handleResponse(res);
}
