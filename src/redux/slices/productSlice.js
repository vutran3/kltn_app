import {createSlice} from '@reduxjs/toolkit';
import {getProducts} from '../thunks/productThunk';

const initialState = {
  data: {},
  isLoading: false,
  error: null,
};

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(getProducts.fulfilled, (state, action) => {
      state.data = action.payload;
    });
  },
});

export default productSlice.reducer;
