import { UploadFile } from '@mui/icons-material';
import { FormControl, FormHelperText, Typography } from '@mui/material';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useController, UseControllerProps } from 'react-hook-form';

interface Props extends UseControllerProps {}

const AppDropzone = (props: Props) => {
  const { fieldState, field } = useController({ ...props, defaultValue: null });

  // styles for the dropzone
  const dzStyles = {
    display: 'flex',
    border: 'dashed 3px #eee',
    borderColor: '#eee',
    borderRadius: '5px',
    paddingTop: 30,
    height: 200,
    width: 500,
    alignItems: 'center',
  };

  const dzActive = {
    borderColor: 'green',
  };

  const onDrop = useCallback(
    (acceptedFiles) => {
      // only allow users to upload 1 image at a time
      acceptedFiles[0] = Object.assign(acceptedFiles[0], {
        // give the file an additional property: "preview"
        preview: URL.createObjectURL(acceptedFiles[0]),
      });
      field.onChange(acceptedFiles[0]);
    },
    [field]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div {...getRootProps()}>
      <FormControl
        style={isDragActive ? { ...dzStyles, ...dzActive } : dzStyles}
        error={!!fieldState.error?.message}
      >
        <input {...getInputProps()} />
        <UploadFile sx={{ fontSize: '100px' }} />
        <Typography variant="h4">Drop image here</Typography>
        <FormHelperText>{fieldState.error?.message}</FormHelperText>
      </FormControl>
    </div>
  );
};

export default AppDropzone;
