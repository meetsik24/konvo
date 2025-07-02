import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WorkspaceState {
  currentWorkspaceId: string | null;
}

const initialState: WorkspaceState = {
  currentWorkspaceId: null,
};

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    setWorkspaceId(state, action: PayloadAction<string | null>) {
      state.currentWorkspaceId = action.payload;
    },
  },
});

export const { setWorkspaceId } = workspaceSlice.actions;
export default workspaceSlice.reducer;