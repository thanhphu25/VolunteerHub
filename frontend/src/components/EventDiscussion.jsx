// src/components/EventDiscussion.jsx
import React, {useCallback, useEffect, useState} from 'react';
import {
  Send as SendIcon,
  ThumbUp as ThumbUpIcon,
  ThumbUpOutlined as ThumbUpOutlinedIcon
} from '@mui/icons-material';
import postApi from '../api/postApi'; // Import API bạn vừa tạo
import {useAuth} from '../context/AuthContext';
import {toast} from 'react-toastify';
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  TextField,
  Typography
} from '@mui/material';

// Component PostItem để hiển thị một bài đăng
function PostItem({post, onCommentSubmit}) {
  const {user} = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [currentLikes, setCurrentLikes] = useState(post.likesCount || 0);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    const checkIfLiked = async () => {
      if (user) {
        try {
          const likesResponse = await postApi.listLikes(post.id);
          const userLike = likesResponse.data.find(
              like => like.userId === user.id);
          setIsLiked(!!userLike);
        } catch (error) {
          console.error("Lỗi kiểm tra trạng thái like:", error);
        }
      }
    };
    checkIfLiked();
  }, [post.id, user]);

  const fetchComments = useCallback(async () => {
    if (!showComments) {
      return;
    }
    setLoadingComments(true);
    try {
      const response = await postApi.listComments(post.id);
      setComments(response.data || []);
    } catch (error) {
      console.error("Lỗi tải bình luận:", error);
      toast.error("Không thể tải bình luận.");
    } finally {
      setLoadingComments(false);
    }
  }, [post.id, showComments]);

  useEffect(() => {
    // Chỉ fetch comment khi showComments là true
    if (showComments) {
      fetchComments();
    }
  }, [showComments, fetchComments]); // Phụ thuộc vào showComments

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      return;
    }
    setIsSubmittingComment(true);
    try {
      await postApi.addComment(post.id, {content: newComment});
      setNewComment('');
      toast.success("Đã gửi bình luận!");
      await fetchComments(); // Tải lại comment ngay
      if (onCommentSubmit) {
        onCommentSubmit(post.id);
      } // Thông báo cho cha để cập nhật count
    } catch (error) {
      console.error("Lỗi gửi bình luận:", error);
      toast.error(error.response?.data?.error || "Gửi bình luận thất bại.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleLikeClick = async () => {
    if (isLiking || !user) {
      return;
    }
    setIsLiking(true);
    try {
      if (isLiked) {
        await postApi.unlikePost(post.id);
        setIsLiked(false);
        setCurrentLikes(prev => Math.max(0, prev - 1));
      } else {
        await postApi.likePost(post.id);
        setIsLiked(true);
        setCurrentLikes(prev => prev + 1);
      }
    } catch (error) {
      console.error("Lỗi khi like/unlike:", error);
      toast.error("Thao tác thích/bỏ thích thất bại.");
    } finally {
      setIsLiking(false);
    }
  };

  return (
      <Paper elevation={1} sx={{p: 2, mb: 2}}>
        {/* Phần thông tin người đăng */}
        <Box display="flex" alignItems="center" mb={1}>
          <Avatar sx={{
            mr: 1.5,
            bgcolor: 'secondary.light'
          }}>{post.userName?.[0]}</Avatar>
          <Box>
            <Typography variant="subtitle1"
                        fontWeight="bold">{post.userName}</Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(post.createdAt).toLocaleString('vi-VN')}
            </Typography>
          </Box>
        </Box>

        {/* Nội dung bài đăng */}
        <Typography
            sx={{whiteSpace: 'pre-line', mb: 1, wordBreak: 'break-word'}}>
          {post.content}
        </Typography>

        {/* Hiển thị ảnh nếu có */}
        {post.imageUrl && (
            <Box sx={{my: 1}}>
              <img src={post.imageUrl} alt="Ảnh bài đăng"
                   style={{maxWidth: '100%', borderRadius: '8px'}}/>
            </Box>
        )}

        {/* DÒNG HIỂN THỊ SỐ LIKE/COMMENT */}
        <Box display="flex" justifyContent="space-between" alignItems="center"
             mt={1} pt={1} borderTop="1px solid #eee">
          <Typography variant="body2" color="text.secondary">{currentLikes} lượt
            thích</Typography>
          <Typography variant="body2" color="text.secondary"
                      sx={{cursor: 'pointer'}}
                      onClick={() => setShowComments(!showComments)}>
            {post.commentsCount || 0} bình luận
          </Typography>
        </Box>
        {/* ======================================================= */}

        <Divider sx={{my: 1}}/>

        {/* === KHU VỰC NÚT BẤM */}
        <Box display="flex" justifyContent="flex-start"> {/* Căn lề trái */}
          <Button
              startIcon={isLiked ? <ThumbUpIcon/> :
                  <ThumbUpOutlinedIcon/>} // Icon thay đổi theo trạng thái like
              onClick={handleLikeClick}
              size="small"
              color={isLiked ? 'primary'
                  : 'inherit'} // Màu thay đổi theo trạng thái like
              disabled={isLiking
                  || !user} // Disable khi đang xử lý hoặc chưa đăng nhập
          >
            {isLiking ? <CircularProgress size={16} sx={{mr: 1}}/>
                : null} {/* Loading nhỏ */}
            {isLiked ? 'Đã thích' : 'Thích'} {/* Text thay đổi */}
          </Button>
          {/* Nút Bình luận đã bị xóa */}
        </Box>
        {/* =========================================== */}


        {/* Phần bình luận */}
        {showComments && (
            <Box mt={2} pl={1} borderLeft="3px solid #eee">
              {/* Form thêm bình luận */}
              <Box component="form" onSubmit={handleCommentSubmit}
                   display="flex" alignItems="center" mb={2}>
                <Avatar sx={{
                  mr: 1,
                  width: 32,
                  height: 32,
                  bgcolor: 'primary.light'
                }}>{user?.fullName?.[0]}</Avatar>
                <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder="Viết bình luận..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={isSubmittingComment}
                    InputProps={{
                      endAdornment: (
                          <IconButton type="submit" size="small"
                                      disabled={!newComment.trim()
                                          || isSubmittingComment}>
                            {isSubmittingComment ? <CircularProgress size={20}/>
                                : <SendIcon/>}
                          </IconButton>
                      )
                    }}
                />
              </Box>

              {/* Danh sách bình luận */}
              {loadingComments ? (
                  <CircularProgress size={24}
                                    sx={{display: 'block', mx: 'auto'}}/>
              ) : comments.length === 0 ? (
                  <Typography variant="body2" color="text.secondary"
                              sx={{ml: 5}}>Chưa có bình luận nào.</Typography>
              ) : (
                  <List dense sx={{
                    width: '100%',
                    bgcolor: 'background.paper',
                    pl: 0
                  }}>
                    {comments.map((comment) => (
                        <ListItem key={comment.id} alignItems="flex-start"
                                  sx={{pl: 0}}>
                          <ListItemAvatar sx={{minWidth: 40, mt: 0.5}}>
                            <Avatar sx={{
                              width: 32,
                              height: 32,
                              bgcolor: 'secondary.light'
                            }}>{comment.userName?.[0]}</Avatar>
                          </ListItemAvatar>

                          <ListItemText
                              primary={
                                // Hiển thị tên người bình luận (in đậm)
                                <Typography component="span" variant="body2"
                                            fontWeight="bold"
                                            color="text.primary">
                                  {comment.userName}
                                </Typography>
                              }
                              secondary={
                                // Sử dụng Fragment (<>) để nhóm nội dung và thời gian
                                <>
                                  {/* Nội dung bình luận */}
                                  <Typography component="span" variant="body2"
                                              color="text.primary" sx={{
                                    display: 'block',
                                    whiteSpace: 'pre-line',
                                    wordBreak: 'break-word'
                                  }}>
                                    {comment.content}
                                  </Typography>
                                  {/* Thời gian bình luận */}
                                  <Typography component="span" variant="caption"
                                              color="text.secondary">
                                    {new Date(comment.createdAt).toLocaleString(
                                        'vi-VN')}
                                  </Typography>
                                </>
                              }
                          />
                          {/* ======================================== */}

                        </ListItem>
                    ))}
                  </List>
              )}
            </Box>
        )}
      </Paper>
  );
}

// Component Chính: EventDiscussion
export default function EventDiscussion({eventId}) {
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const {user} = useAuth();

  // --- Hàm fetch posts ---
  const fetchPosts = useCallback(async () => {
    try {
      const response = await postApi.listPosts(eventId,
          {sort: 'createdAt,desc'}); // Sắp xếp mới nhất lên đầu
      setPosts(response.data.content || []);
    } catch (error) {
      console.error("Lỗi tải bài đăng:", error);
      if (loadingPosts) {
        toast.error("Không thể tải các bài đăng.");
      } // Chỉ báo lỗi lần đầu
    } finally {
      if (loadingPosts) {
        setLoadingPosts(false);
      } // Chỉ set false lần đầu
    }
  }, [eventId, loadingPosts]); // Thêm loadingPosts vào dependency

  useEffect(() => {
    setLoadingPosts(true); // Set loading khi component mount hoặc eventId đổi
    fetchPosts();
  }, [eventId]); // Chỉ fetch lại khi eventId thay đổi

  // --- Hàm xử lý tạo bài đăng mới ---
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) {
      return;
    }
    setIsSubmittingPost(true);
    try {
      await postApi.createPost(eventId,
          {content: newPostContent /*, imageUrl: TBD */});
      setNewPostContent('');
      toast.success("Đăng bài thành công!");
      await fetchPosts(); // Tải lại danh sách posts
    } catch (error) {
      console.error("Lỗi đăng bài:", error);
      toast.error(error.response?.data?.error || "Đăng bài thất bại.");
    } finally {
      setIsSubmittingPost(false);
    }
  };

  // --- Hàm callback khi có comment mới được thêm (để cập nhật count) ---
  const handleNewCommentAdded = async () => {
    // Chỉ cần fetch lại để cập nhật số lượng comment trên post
    await fetchPosts();
  }

  return (
      <Box mt={4}>
        <Typography variant="h5" gutterBottom>Thảo luận sự kiện</Typography>

        {/* Form tạo bài đăng */}
        <Paper elevation={2} sx={{p: 2, mb: 3}}>
          <Box display="flex" alignItems="flex-start">
            <Avatar sx={{
              mt: 1,
              mr: 1.5,
              bgcolor: 'primary.light'
            }}>{user?.fullName?.[0]}</Avatar>
            <form onSubmit={handleCreatePost} style={{width: '100%'}}>
              <TextField
                  fullWidth
                  multiline
                  minRows={2} // Ít nhất 2 dòng
                  variant="outlined"
                  placeholder={`Bạn nghĩ gì về sự kiện này, ${user?.fullName}?`}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  disabled={isSubmittingPost}
                  sx={{mb: 1}}
              />
              {/* TODO: Thêm nút upload ảnh */}
              <Box textAlign="right">
                <Button
                    type="submit"
                    variant="contained"
                    disabled={!newPostContent.trim() || isSubmittingPost}
                    startIcon={isSubmittingPost ? <CircularProgress size={20}
                                                                    color="inherit"/>
                        : <SendIcon/>}
                >
                  Đăng bài
                </Button>
              </Box>
            </form>
          </Box>
        </Paper>

        {/* Danh sách bài đăng */}
        {loadingPosts ? (
            <Box textAlign="center" py={5}><CircularProgress/></Box>
        ) : posts.length === 0 ? (
            <Typography
                sx={{textAlign: 'center', color: 'text.secondary', my: 3}}>
              Hãy là người đầu tiên bắt đầu thảo luận! ✍️
            </Typography>
        ) : (
            posts.map((post) => (
                <PostItem
                    key={post.id}
                    post={post}
                    onCommentSubmit={handleNewCommentAdded} // Truyền callback xuống
                />
            ))
        )}
        {/* TODO: Thêm nút "Tải thêm bài đăng" nếu dùng phân trang */}
      </Box>
  );
}