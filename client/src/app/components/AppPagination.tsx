import { Box, Typography, Pagination } from '@mui/material';
import { Metadata } from '../models/pagination';

interface Props {
  metaData: Metadata;
  onPageChange: (page: number) => void;
}

const AppPagination = ({ metaData, onPageChange }: Props) => {
  const { currentPage, pageSize, totalCount, totalPages } = metaData;
  const first = (currentPage - 1) * pageSize + 1;
  const last =
    currentPage * pageSize > totalCount ? totalCount : currentPage * pageSize;
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Typography>
        Displaying {first}-{last} of {totalCount} items
      </Typography>
      <Pagination
        color="secondary"
        size="large"
        count={totalPages}
        page={currentPage}
        onChange={(e, page) => onPageChange(page)}
      />
    </Box>
  );
};

export default AppPagination;
