import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import storage from "redux-persist/lib/storage";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import authReducer from "./authSlice";
import recipeReducer from "./recipeSlice";

// Kết hợp tất cả reducers
const rootReducer = combineReducers({
  auths: authReducer,
  recipes: recipeReducer,
});

// Cấu hình persist
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auths"], // Chỉ lưu trữ trạng thái xác thực, không lưu recipes
};

// Tạo persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Tạo Redux store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        // Cho phép FormData trong các action
        ignoredActionPaths: ['meta.arg', 'payload'],
        ignoredPaths: ['recipes.currentRecipe.image', 'recipes.currentRecipe.sections'],
      },
    }),
});

// Tạo persistor
export const persistor = persistStore(store);
