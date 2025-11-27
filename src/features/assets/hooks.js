import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assetService } from './services';

export function useAssets() {
  return useQuery({
    queryKey: ['assets'],
    queryFn: assetService.getAll,
  });
}

export function useAsset(id) {
  return useQuery({
    queryKey: ['assets', id],
    queryFn: () => assetService.getById(id),
    enabled: !!id,
  });
}

export function useCreateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assetService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
}
