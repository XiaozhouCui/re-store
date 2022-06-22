import { Box, Typography, Pagination } from '@mui/material';
import { useState } from 'react';
import { Metadata } from '../models/pagination';

interface Props {
  metaData: Metadata;
  onPageChange: (page: number) => void;
}

const AppPagination = ({ metaData, onPageChange }: Props) => {
  const { currentPage, pageSize, totalCount, totalPages } = metaData;
  const [pageNumber, setPageNumber] = useState(currentPage);
  const first = (currentPage - 1) * pageSize + 1;
  const last =
    currentPage * pageSize > totalCount ? totalCount : currentPage * pageSize;

  const handlePageChange = (page: number) => {
    setPageNumber(page);
    onPageChange(page);
  };

  return (
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Typography>
        Displaying {first}-{last} of {totalCount} items
      </Typography>
      <Pagination
        color="secondary"
        size="large"
        count={totalPages}
        page={pageNumber}
        onChange={(e, page) => handlePageChange(page)}
      />
    </Box>
  );
};

export default AppPagination;
