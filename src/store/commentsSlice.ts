import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as commentsApi from '../api/comments';
import { Comment, CommentData } from '../types/Comment';
import { RootState } from './index';

type CommentsState = {
  items: Comment[];
  loaded: boolean;
  hasError: boolean;
};

const initialState: CommentsState = {
  items: [],
  loaded: false,
  hasError: false,
};

export const loadCommentsByPostId = createAsyncThunk(
  'comments/loadCommentsByPostId',
  async (postId: number) => {
    return commentsApi.getPostComments(postId);
  },
);

export const createCommentForPost = createAsyncThunk(
  'comments/createCommentForPost',
  async (payload: CommentData & { postId: number }) => {
    return commentsApi.createComment(payload);
  },
);

export const deleteCommentById = createAsyncThunk(
  'comments/deleteCommentById',
  async (commentId: number) => {
    await commentsApi.deleteComment(commentId);

    return commentId;
  },
);

const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    removeComment: (state, action: PayloadAction<number>) => ({
      ...state,
      items: state.items.filter(comment => comment.id !== action.payload),
    }),
    resetComments: state => ({
      ...state,
      items: [],
      loaded: false,
      hasError: false,
    }),
  },
  extraReducers: builder => {
    builder
      .addCase(loadCommentsByPostId.pending, state => ({
        ...state,
        items: [],
        loaded: false,
        hasError: false,
      }))
      .addCase(loadCommentsByPostId.fulfilled, (state, action) => ({
        ...state,
        items: action.payload,
        loaded: true,
        hasError: false,
      }))
      .addCase(loadCommentsByPostId.rejected, state => ({
        ...state,
        items: [],
        loaded: true,
        hasError: true,
      }))
      .addCase(createCommentForPost.fulfilled, (state, action) => ({
        ...state,
        items: [...state.items, action.payload],
      }))
      .addCase(createCommentForPost.rejected, state => ({
        ...state,
        hasError: true,
      }))
      .addCase(deleteCommentById.rejected, state => ({
        ...state,
        hasError: true,
      }));
  },
});

export const { removeComment, resetComments } = commentsSlice.actions;
export const commentsReducer = commentsSlice.reducer;

export const selectComments = (state: RootState) => state.comments.items;
export const selectCommentsLoaded = (state: RootState) => state.comments.loaded;
export const selectCommentsHasError = (state: RootState) =>
  state.comments.hasError;
