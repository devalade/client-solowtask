import {
  TextInput,
  PasswordInput,
  Checkbox,
  Group,
  Center,
  Button,
  Paper,
  Text,
  Stack,
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { showNotification, updateNotification } from '@mantine/notifications';
import { CheckIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { AxiosError } from 'axios';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { useMutation } from 'react-query';
import { z } from 'zod';
import { registerUser } from '../lib/fetchApi';
import { setAccessToken, setRefreshToken } from '../lib/tokens';

const registerSchema = z
  .object({
    firstName: z
      .string({
        required_error: 'Fistname is required',
        invalid_type_error: 'Fistname must be a string',
      })
      .nonempty({ message: 'You should provide the firstname' }),
    lastName: z
      .string({
        required_error: 'Lastname is required',
        invalid_type_error: 'Name must be a string',
      })
      .nonempty({ message: 'You should provide the lastname' }),
    email: z.string().email({ message: 'Email incorrect' }),
    password: z
      .string({
        required_error: 'you must provide a password',
      })
      .nonempty({ message: 'you must provide a password' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password don't match",
    path: ['confirmPassword'], // path of error
  });

function Register() {
  const router = useRouter();

  const form = useForm({
    schema: zodResolver(registerSchema),
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const mutation = useMutation<
    string,
    AxiosError,
    Parameters<typeof registerUser>['0']
  >('register', registerUser, {
    onMutate: () => {
      showNotification({
        id: 'register',
        title: 'Creating account',
        message: 'Please wait...',
        loading: true,
      });
    },
    onSuccess: (data: any) => {
      updateNotification({
        id: 'register',
        icon: <CheckIcon width='14' height='14' strokeWidth='2' />,
        title: 'Success',
        message: 'Successfully created account',
        color: 'green',
      });

      setAccessToken(data.access_token);
      setRefreshToken(data.refresh_token);
      router.push('/login');
    },
    onError: (error) => {
      updateNotification({
        id: 'register',
        icon: (
          <ExclamationTriangleIcon width='14' height='14' strokeWidth='2' />
        ),
        title: 'Error',
        message: error.response?.data.message,
        color: 'red',
      });
    },
  });

  const handleSubmit = useCallback((data: any) => {
    mutation.mutate(data);
  }, []);

  return (
    <Center
      sx={(theme) => ({
        backgroundColor:
          theme.colorScheme === 'dark'
            ? theme.colors.dark[8]
            : theme.colors.gray[0],
        width: '100%',
        height: '100vh',
      })}>
      <Paper
        shadow='xl'
        radius='md'
        sx={{ width: 350, padding: '2.5em' }}
        mx='auto'>
        <Text align='center' color='dark' weight='bold' pb='xs' size='lg'>
          Let's go
        </Text>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack spacing='xs'>
            <TextInput label='Firstname' {...form.getInputProps('firstName')} />
            <TextInput label='Lastname' {...form.getInputProps('lastName')} />
            <TextInput label='Email' {...form.getInputProps('email')} />
            <PasswordInput
              label='Password'
              {...form.getInputProps('password')}
            />
            <PasswordInput
              mt='sm'
              label='Confirm password'
              {...form.getInputProps('confirmPassword')}
            />

            <Group position='right' mt='md'>
              <Button fullWidth type='submit'>
                Submit
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Center>
  );
}

export default Register;
