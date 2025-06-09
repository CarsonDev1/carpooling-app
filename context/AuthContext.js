// context/AuthContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { checkAuthStatus, logoutUser } from '../api/authApi';

// Initial state
const initialState = {
	isAuthenticated: false,
	user: null,
	token: null,
	loading: true,
	error: null,
};

// Action types
const AuthActionTypes = {
	SET_LOADING: 'SET_LOADING',
	LOGIN_SUCCESS: 'LOGIN_SUCCESS',
	LOGOUT: 'LOGOUT',
	UPDATE_USER: 'UPDATE_USER',
	SET_ERROR: 'SET_ERROR',
	CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const authReducer = (state, action) => {
	switch (action.type) {
		case AuthActionTypes.SET_LOADING:
			return {
				...state,
				loading: action.payload,
			};

		case AuthActionTypes.LOGIN_SUCCESS:
			return {
				...state,
				isAuthenticated: true,
				user: action.payload.user,
				token: action.payload.token,
				loading: false,
				error: null,
			};

		case AuthActionTypes.LOGOUT:
			return {
				...state,
				isAuthenticated: false,
				user: null,
				token: null,
				loading: false,
				error: null,
			};

		case AuthActionTypes.UPDATE_USER:
			return {
				...state,
				user: { ...state.user, ...action.payload },
			};

		case AuthActionTypes.SET_ERROR:
			return {
				...state,
				error: action.payload,
				loading: false,
			};

		case AuthActionTypes.CLEAR_ERROR:
			return {
				...state,
				error: null,
			};

		default:
			return state;
	}
};

// Create context
const AuthContext = createContext(null);

// Auth provider component
export const AuthProvider = ({ children }) => {
	const [state, dispatch] = useReducer(authReducer, initialState);

	// Kiểm tra trạng thái đăng nhập khi app khởi động
	useEffect(() => {
		const initializeAuth = async () => {
			try {
				const authStatus = await checkAuthStatus();

				if (authStatus.isAuthenticated) {
					dispatch({
						type: AuthActionTypes.LOGIN_SUCCESS,
						payload: {
							user: authStatus.user,
							token: authStatus.token,
						},
					});
				} else {
					dispatch({ type: AuthActionTypes.SET_LOADING, payload: false });
				}
			} catch (error) {
				console.error('Initialize auth error:', error);
				dispatch({ type: AuthActionTypes.SET_LOADING, payload: false });
			}
		};

		initializeAuth();
	}, []);

	// Action creators
	const login = (user, token) => {
		dispatch({
			type: AuthActionTypes.LOGIN_SUCCESS,
			payload: { user, token },
		});
	};

	const logout = async () => {
		try {
			await logoutUser();
		} catch (error) {
			console.error('Logout error:', error);
		} finally {
			dispatch({ type: AuthActionTypes.LOGOUT });
		}
	};

	const updateUser = (userData) => {
		dispatch({
			type: AuthActionTypes.UPDATE_USER,
			payload: userData,
		});
	};

	const setError = (error) => {
		dispatch({
			type: AuthActionTypes.SET_ERROR,
			payload: error,
		});
	};

	const clearError = () => {
		dispatch({ type: AuthActionTypes.CLEAR_ERROR });
	};

	const setLoading = (loading) => {
		dispatch({
			type: AuthActionTypes.SET_LOADING,
			payload: loading,
		});
	};

	const contextValue = {
		...state,
		login,
		logout,
		updateUser,
		setError,
		clearError,
		setLoading,
	};

	return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// Custom hook
export const useAuth = () => {
	const context = useContext(AuthContext);

	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider');
	}

	return context;
};
