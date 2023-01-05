import { createAsyncThunk, createSlice, nanoid } from '@reduxjs/toolkit'
import axios from 'axios'
import { sub } from 'date-fns'


// const initialState = [
//     {
//         id: 1,
//         title: 'Learning Redux Toolkit',
//         content: 'The Redux Toolkit package is intended to be the standard way to write Redux logic. It was originally created to help address three common concerns about Redux',
//         date: sub(new Date(), { minutes: 10 }).toISOString(),
//         reactions: {
//             thumbsUp: 0,
//             wow: 0,
//             heart: 0,
//             rocket: 0,
//             coffee: 0
//         }
//     },
//     {
//         id: 2,
//         title: 'Learning React',
//         content: 'What is React used for? It\'s used for building interactive user interfaces and web applications quickly and efficiently with significantly less code than you would with vanilla JavaScript',
//         date: sub(new Date(), { minutes: 5 }).toISOString(),
//         reactions: {
//             thumbsUp: 0,
//             wow: 0,
//             heart: 1,
//             rocket: 0,
//             coffee: 0
//         }
//     }
// ]

const POSTS_URL = 'https://jsonplaceholder.typicode.com/posts'

const initialState = {
    posts: [],
    status: 'idle', // 'idle', 'loading', 'succeeded', 'failed'
    error: null
}

const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {
    const response = await axios.get(POSTS_URL)

    return response.data
})

const addNewPost = createAsyncThunk('posts/addNewPost', async (initialPost) => {
    const response = await axios.post(POSTS_URL, initialPost)

    return response.data
})

const postsSlice = createSlice({
    name: 'posts',
    initialState,
    reducers: {
        addPost: {
            prepare: (title, content, userId) => ({
                payload: {
                    id: nanoid(),
                    title: title,
                    content: content,
                    userId: userId,
                    date: new Date().toISOString(),
                    reactions: {
                        thumbsUp: 0,
                        wow: 0,
                        heart: 0,
                        rocket: 0,
                        coffee: 0
                    }
                }
            }),
            reducer: (state, action) => {
                state.posts.push(action.payload)
            },
        },
        addReaction: (state, action) => {
            const { postId, reaction } = action.payload
            const existingPost = state.posts.find(
                (post) => post.id === postId
            )
            if (!existingPost)
                return new Error(`No post found with ID: ${postId}`)
            
            existingPost.reactions[reaction]++            
        },
        removePost: (state, action) => {
            state = state.posts.filter(
                (post) => post.id !== action.payload
            )
        },
        editPost: (state, action) => {             
            state = state.posts.map(
                (post) => post.id = action.payload.id
                    ? action.payload
                    : post
            )
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPosts.pending, (state) => {
                state.status = 'loading'
            })
            .addCase(fetchPosts.fulfilled, (state, action) => {
                state.status = 'succeeded'
                let minutes = 1
                const loadedPosts = action.payload.map((post) => {
                    post.date = sub(
                        new Date(),
                        { minutes: minutes++ }
                    ).toISOString()

                    post.reactions = {
                        thumbsUp: 0,
                        wow: 0,
                        heart: 0,
                        rocket: 0,
                        coffee: 0
                    }

                    return post
                })

                state.posts = state.posts.concat(loadedPosts)
            })
            .addCase(fetchPosts.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message
            })
            .addCase(addNewPost.fulfilled, (state, action) => {
                action.payload.userId = Number(action.payload.userId)
                action.payload.data = new Date().toISOString()
                action.payload.reactions = {
                    thumbsUp: 0,
                    wow: 0,
                    heart: 0,
                    rocket: 0,
                    coffee: 0
                }

                state.posts.push(action.payload)
            })
    }
})

const selectAllPosts = (state) => state.posts.posts
const selectPostsStatus = (state) => state.posts.status
const selectPostsError = (state) => state.posts.error
const selectedPostById = (state, postId) =>
    state.posts.posts.find((post) => postId === post.id)


export {
    selectAllPosts,
    selectPostsStatus,
    selectPostsError,
    selectedPostById,
}

export {
    fetchPosts,
    addNewPost,
}

export const {
    addPost,
    addReaction,    
    removePost,
    editPost,
} = postsSlice.actions

export default postsSlice.reducer