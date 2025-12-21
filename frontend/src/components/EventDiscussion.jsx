/**
 * EventDiscussion Component
 * Manages event discussion feature allowing registered volunteers and event organizers
 * to create posts, add comments, and like content within an event's discussion board.
 * Supports pagination, image uploads, and real-time interaction feedback.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.eventId - ID of the event for which to display discussions
 * @param {Object} props.event - Event object containing event details
 * @param {Object} props.registration - Current user's event registration information
 * @returns {JSX.Element} Discussion board interface with post creation and viewing features
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Collapse,
    Divider,
    IconButton,
    Pagination,
    Stack,
    TextField,
    Typography,
    CircularProgress
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SendIcon from '@mui/icons-material/Send';
import { toast } from 'react-toastify';

import postApi from '../api/postApi';
import { useAuth } from '../context/AuthContext';
import ImageUploader from './ImageUploader';

const DEFAULT_PAGE_SIZE = 10;

/**
 * Formats a date value to Vietnamese locale date-time string
 * @param {string|Date} value - Date value to format
 * @returns {string} Formatted date-time string or original value if parsing fails
 */
function formatDateTime(value) {
    if (!value) return '';
    try {
        return new Date(value).toLocaleString('vi-VN', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });
    } catch (err) {
        return value;
    }
}

const emptyPage = {
    content: [],
    totalPages: 0,
    totalElements: 0,
    number: 0
};

export default function EventDiscussion({ eventId, event, registration }) {
    const { user } = useAuth();

    const [postsPage, setPostsPage] = useState(emptyPage);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [posting, setPosting] = useState(false);
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostImageUrl, setNewPostImageUrl] = useState('');

    const [expandedPosts, setExpandedPosts] = useState([]);
    const [commentsMap, setCommentsMap] = useState({});
    const [commentDrafts, setCommentDrafts] = useState({});
    const [likingMap, setLikingMap] = useState({});

    const currentPage = postsPage.number ?? 0;
    const totalPages = postsPage.totalPages ?? 0;

    const loadPosts = useCallback(async (page = 0) => {
        setLoading(true);
        setError(null);
        try {
            const res = await postApi.listPosts(eventId, { page, size: DEFAULT_PAGE_SIZE });
            setPostsPage(res.data ?? emptyPage);
        } catch (err) {
            console.error('Failed to load posts', err);
            setError(err.response?.data?.error || 'Không thể tải kênh thảo luận.');
        } finally {
            setLoading(false);
        }
    }, [eventId]);

    useEffect(() => {
        loadPosts(0);
        setExpandedPosts([]);
        setCommentsMap({});
        setCommentDrafts({});
        setLikingMap({});
    }, [eventId, loadPosts]);

    useEffect(() => {
        if (postsPage.content) {
            const newLikingMap = {};
            postsPage.content.forEach(post => {
                if (post.isLiked !== undefined) {
                    newLikingMap[post.id] = post.isLiked;
                }
            });
            setLikingMap(prev => ({ ...prev, ...newLikingMap }));
        }
    }, [postsPage.content]);

    const isAuthenticated = Boolean(user);

    const canParticipate = useMemo(() => {
        if (!isAuthenticated || !user) {
            return false;
        }
        const role = (user.role || '').toLowerCase();
        const userId = user?.id != null ? Number(user.id) : null;
        const organizerId = event?.organizerId != null ? Number(event.organizerId) : null;
        const registrationStatus = (registration?.status || '').toLowerCase();

        if (role === 'admin') return true;
        if (role === 'organizer' && organizerId != null && userId != null && organizerId === userId) return true;
        if (role === 'volunteer' && (
            registrationStatus === 'approved' ||
            registrationStatus === 'completed' ||
            registrationStatus === 'rejected'
        )) return true;

        return false;
    }, [event?.organizerId, isAuthenticated, registration?.status, user]);

    const handleCreatePost = async () => {
        if (!canParticipate) {
            toast.warn('Chỉ tình nguyện viên đã được duyệt, người tổ chức hoặc quản trị viên mới có thể đăng bài.');
            return;
        }
        if (!newPostContent.trim()) {
            toast.warn('Nội dung bài viết không được để trống.');
            return;
        }
        setPosting(true);
        try {
            await postApi.createPost(eventId, {
                content: newPostContent.trim(),
                imageUrl: newPostImageUrl.trim() || undefined
            });
            toast.success('Đăng bài thành công.');
            setNewPostContent('');
            setNewPostImageUrl('');
            await loadPosts(0);
        } catch (err) {
            console.error('Failed to create post', err);
            toast.error(err.response?.data?.error || 'Không thể đăng bài.');
        } finally {
            setPosting(false);
        }
    };

    const toggleComments = async (postId) => {
        setExpandedPosts(prev => {
            const exists = prev.includes(postId);
            if (exists) {
                return prev.filter(id => id !== postId);
            }
            return [...prev, postId];
        });

        setCommentsMap(prev => {
            if (prev[postId]?.items) {
                return prev;
            }
            return {
                ...prev,
                [postId]: { items: [], loading: true }
            };
        });

        try {
            const res = await postApi.listComments(postId);
            setCommentsMap(prev => ({
                ...prev,
                [postId]: { items: res.data ?? [], loading: false }
            }));
        } catch (err) {
            console.error('Failed to load comments', err);
            setCommentsMap(prev => ({
                ...prev,
                [postId]: { items: [], loading: false, error: err.response?.data?.error || 'Không thể tải bình luận.' }
            }));
            toast.error(err.response?.data?.error || 'Không thể tải bình luận.');
        }
    };

    const handleAddComment = async (postId) => {
        if (!canParticipate) {
            toast.warn('Chỉ tình nguyện viên đã được duyệt, người tổ chức hoặc quản trị viên mới có thể bình luận.');
            return;
        }
        const draft = commentDrafts[postId]?.trim();
        if (!draft) {
            toast.warn('Vui lòng nhập nội dung bình luận.');
            return;
        }
        setCommentsMap(prev => ({
            ...prev,
            [postId]: { ...(prev[postId] ?? { items: [] }), submitting: true }
        }));
        try {
            const res = await postApi.addComment(postId, { content: draft });
            setCommentsMap(prev => ({
                ...prev,
                [postId]: {
                    items: [...(prev[postId]?.items ?? []), res.data],
                    loading: false,
                    submitting: false
                }
            }));
            setCommentDrafts(prev => ({ ...prev, [postId]: '' }));
            await loadPosts(currentPage);
        } catch (err) {
            console.error('Failed to add comment', err);
            setCommentsMap(prev => ({
                ...prev,
                [postId]: { ...(prev[postId] ?? { items: [] }), submitting: false }
            }));
            toast.error(err.response?.data?.error || 'Không thể gửi bình luận.');
        }
    };

    const handleToggleLike = async (postId) => {
        if (!canParticipate) {
            toast.warn('Chỉ tình nguyện viên đã được duyệt, người tổ chức hoặc quản trị viên mới có thể thích bài viết.');
            return;
        }
        const post = postsPage.content?.find(p => p.id === postId);
        const currentlyLiked = likingMap[postId] ?? post?.isLiked ?? false;

        setLikingMap(prev => ({ ...prev, [postId]: !currentlyLiked }));

        try {
            if (currentlyLiked) {
                await postApi.unlikePost(postId);
            } else {
                await postApi.likePost(postId);
            }
            await loadPosts(currentPage);
        } catch (err) {
            console.error('Failed to toggle like', err);
            setLikingMap(prev => ({ ...prev, [postId]: currentlyLiked }));
            toast.error(err.response?.data?.error || 'Không thể cập nhật lượt thích.');
        }
    };

    const handlePageChange = async (_, pageNumber) => {
        await loadPosts(pageNumber - 1);
    };

    const renderPostCard = (post) => {
        const postId = post.id;
        const commentsState = commentsMap[postId] || { items: [], loading: false };
        const draft = commentDrafts[postId] ?? '';
        const isExpanded = expandedPosts.includes(postId);
        const isSubmittingComment = Boolean(commentsState.submitting);
        const liked = likingMap[postId] ?? post.isLiked ?? false;

        return (
            <Card key={postId} sx={{ mb: 3 }}>
                <CardHeader
                    avatar={
                        <Avatar
                            alt={post.userName || 'User'}
                            src={post.userAvatarUrl ? (
                                post.userAvatarUrl.startsWith('http')
                                    ? post.userAvatarUrl
                                    : `http://localhost:8080${post.userAvatarUrl}`
                            ) : undefined}
                        >
                            {post.userName?.charAt(0)?.toUpperCase() ?? '?'}
                        </Avatar>
                    }
                    title={post.userName || 'Người dùng'}
                    subheader={formatDateTime(post.createdAt)}
                />
                <CardContent>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                        {post.content}
                    </Typography>
                    {post.imageUrl && (
                        <Box
                            component="img"
                            src={post.imageUrl.startsWith('http') ? post.imageUrl : `http://localhost:8080${post.imageUrl}`}
                            alt="Post"
                            sx={{ mt: 2, maxHeight: 300, width: '100%', objectFit: 'contain', borderRadius: 1, bgcolor: '#f5f5f5' }}
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400?text=Image+Error" }}
                        />
                    )}
                </CardContent>
                <CardActions disableSpacing>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <IconButton onClick={() => handleToggleLike(postId)} color={liked ? 'error' : 'default'} disabled={!canParticipate}>
                            {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                        </IconButton>
                        <Typography variant="body2">{post.likesCount}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: 2 }}>
                        <IconButton onClick={() => toggleComments(postId)}>
                            <ChatBubbleOutlineIcon />
                        </IconButton>
                        <Typography variant="body2">{post.commentsCount}</Typography>
                    </Stack>
                </CardActions>
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <Divider />
                    <CardContent>
                        {commentsState.loading ? (
                            <Box display="flex" justifyContent="center" py={2}>
                                <CircularProgress size={24} />
                            </Box>
                        ) : (
                            <Stack spacing={2}>
                                {(commentsState.items ?? []).map(comment => (
                                    <Box key={comment.id} sx={{ display: 'flex', gap: 1.5 }}>
                                        <Avatar
                                            alt={comment.userName || 'User'}
                                            src={comment.userAvatarUrl ? (
                                                comment.userAvatarUrl.startsWith('http')
                                                    ? comment.userAvatarUrl
                                                    : `http://localhost:8080${comment.userAvatarUrl}`
                                            ) : undefined}
                                            sx={{ width: 32, height: 32 }}
                                        >
                                            {comment.userName?.charAt(0)?.toUpperCase() ?? '?'}
                                        </Avatar>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="subtitle2">{comment.userName}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {formatDateTime(comment.createdAt)}
                                            </Typography>
                                            <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mt: 0.5 }}>
                                                {comment.content}
                                            </Typography>
                                            <Divider sx={{ mt: 1 }} />
                                        </Box>
                                    </Box>
                                ))}
                                {isAuthenticated && canParticipate && (
                                    <Stack spacing={1}>
                                        <TextField
                                            label="Bình luận của bạn"
                                            multiline
                                            minRows={2}
                                            value={draft}
                                            onChange={(e) => setCommentDrafts(prev => ({ ...prev, [postId]: e.target.value }))}
                                            fullWidth
                                        />
                                        <Box display="flex" justifyContent="flex-end">
                                            <Button
                                                variant="contained"
                                                size="small"
                                                endIcon={<SendIcon />}
                                                onClick={() => handleAddComment(postId)}
                                                disabled={isSubmittingComment}
                                            >
                                                {isSubmittingComment ? 'Đang gửi...' : 'Gửi bình luận'}
                                            </Button>
                                        </Box>
                                    </Stack>
                                )}
                                {!isAuthenticated && (
                                    <Typography variant="body2" color="text.secondary">
                                        Đăng nhập để tham gia thảo luận.
                                    </Typography>
                                )}
                                {isAuthenticated && !canParticipate && (
                                    <Typography variant="body2" color="text.secondary">
                                        Chỉ tình nguyện viên đã được duyệt, người tổ chức hoặc quản trị viên mới có thể tham gia thảo luận.
                                    </Typography>
                                )}
                            </Stack>
                        )}
                    </CardContent>
                </Collapse>
            </Card>
        );
    };

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom fontWeight="bold">
                Kênh trao đổi
            </Typography>

            {isAuthenticated && canParticipate && (
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                            Tạo bài đăng mới
                        </Typography>
                        <Stack spacing={2}>
                            <TextField
                                label="Nội dung bài viết"
                                multiline
                                minRows={3}
                                value={newPostContent}
                                onChange={(e) => setNewPostContent(e.target.value)}
                                fullWidth
                            />

                            { }
                            <Box>
                                <ImageUploader
                                    label="Hình ảnh đính kèm (Tùy chọn)"
                                    value={newPostImageUrl}
                                    onChange={(url) => setNewPostImageUrl(url)}
                                    placeholder="Nhập link hoặc tải ảnh lên..."
                                />
                            </Box>
                            { }

                            <Box display="flex" justifyContent="flex-end">
                                <Button
                                    variant="contained"
                                    onClick={handleCreatePost}
                                    disabled={posting}
                                >
                                    {posting ? 'Đang đăng...' : 'Đăng bài'}
                                </Button>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
            )}

            {isAuthenticated && !canParticipate && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    Chỉ tình nguyện viên đã được duyệt, người tổ chức hoặc quản trị viên mới có thể tạo bài đăng và tương tác trong kênh này.
                </Alert>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            )}

            {loading ? (
                <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {postsPage.content.length === 0 ? (
                        <Typography color="text.secondary">
                            Chưa có bài trao đổi nào.
                        </Typography>
                    ) : (
                        postsPage.content.map(renderPostCard)
                    )}

                    {totalPages > 1 && (
                        <Box display="flex" justifyContent="center" mt={3}>
                            <Pagination
                                count={totalPages}
                                page={currentPage + 1}
                                onChange={handlePageChange}
                                color="primary"
                            />
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
}