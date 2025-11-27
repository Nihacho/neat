import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loanService } from './services';

export function useLoans() {
  return useQuery({
    queryKey: ['loans'],
    queryFn: loanService.getAll,
  });
}

export function useActiveLoans() {
  return useQuery({
    queryKey: ['loans', 'active'],
    queryFn: loanService.getActive,
  });
}

export function useCreateLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loanService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
}

export function useReturnLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loanService.returnLoan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
}
