import { useAPI } from './useAPI';

export interface ChangePasswordData {
  old_password: string;
  new_password: string;
}

export const useChangePassword = () => {
  const { API } = useAPI();

  const {
    mutateAsync: changePassword,
    status,
    error,
    isLoading,
    asyncStatus
  } = useMutation({
    mutation: async (data: ChangePasswordData) => {
      const response = await API('/change-password/', {
        method: 'POST',
        body: data
      });
      return response;
    }
  });

  return {
    changePassword,
    status,
    error,
    isLoading,
    asyncStatus
  };
};
