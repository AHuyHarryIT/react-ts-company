// Credential Management API – not yet in TS's default lib definitions
declare global {
  interface PasswordCredentialInit {
    id: string;
    password: string;
  }
  interface PasswordCredential extends Credential {
    readonly password: string;
  }
  // eslint-disable-next-line no-var
  var PasswordCredential:
    | {
        new (init: PasswordCredentialInit): PasswordCredential;
        prototype: PasswordCredential;
      }
    | undefined;
}

import { useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, useSearch } from '@tanstack/react-router';
import type { FormProps } from 'antd';
import { Button, Form, Input, message } from 'antd';

import { authLogin } from '@services/AuthService';

import { FaRegUser } from 'react-icons/fa';
import { IoLockClosedOutline } from 'react-icons/io5';

type FieldType = {
  username: string;
  password: string;
};

type LoginSearch = {
  redirect?: string;
};

/**
 * Trigger the browser's native "Save password?" prompt.
 *
 * 1. Try the modern Credential Management API (Chrome 51+, Edge 79+).
 * 2. Fallback: submit a hidden `<form>` targeting a hidden `<iframe>` so
 *    older browsers / Firefox still see a "real" form submission and offer
 *    to save credentials.
 */
const triggerBrowserSavePassword = (
  username: string,
  password: string,
  redirectTo: string
) => {
  // --- Modern API ---
  if (window.PasswordCredential) {
    const PC = window.PasswordCredential;
    const cred = new PC({
      id: username,
      password: password
    });
    navigator.credentials.store(cred).finally(() => {
      window.location.href = redirectTo;
    });
    return;
  }

  // --- Fallback: hidden form submit ---
  // Create a tiny invisible iframe as the form target
  const iframe = document.createElement('iframe');
  iframe.name = '__saveCredFrame';
  iframe.style.display = 'none';
  document.body.appendChild(iframe);

  // Build a real <form> with proper autocomplete attributes
  const hiddenForm = document.createElement('form');
  hiddenForm.method = 'POST';
  hiddenForm.action = window.location.href; // same page – the iframe swallows the response
  hiddenForm.target = '__saveCredFrame';
  hiddenForm.style.display = 'none';

  const uInput = document.createElement('input');
  uInput.type = 'text';
  uInput.name = 'username';
  uInput.autocomplete = 'username';
  uInput.value = username;

  const pInput = document.createElement('input');
  pInput.type = 'password';
  pInput.name = 'password';
  pInput.autocomplete = 'current-password';
  pInput.value = password;

  hiddenForm.appendChild(uInput);
  hiddenForm.appendChild(pInput);
  document.body.appendChild(hiddenForm);

  hiddenForm.submit();

  // Redirect shortly after – gives the browser time to process
  setTimeout(() => {
    document.body.removeChild(hiddenForm);
    document.body.removeChild(iframe);
    window.location.href = redirectTo;
  }, 500);
};

export const Route = createFileRoute('/(auth)/login')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect: search.redirect as string | undefined
  }),
  head: () => ({
    title: 'Đăng nhập',
    meta: [
      {
        name: 'description',
        content: 'Trang đăng nhập của ứng dụng'
      }
    ]
  })
});

function RouteComponent() {
  const [form] = Form.useForm();
  const search = useSearch({ from: '/(auth)/login' });

  const { mutate: loginMutation, isPending } = useMutation({
    mutationKey: ['authLogin'],
    mutationFn: ({ username, password }: FieldType) =>
      authLogin(username, password),
    onSuccess: () => {
      message.success('Đăng nhập thành công!');

      const redirectTo =
        search.redirect && search.redirect !== '/login' ? search.redirect : '/';

      const values = lastValuesRef.current;
      if (values) {
        // Trigger browser's native "Save password?" prompt, then redirect
        triggerBrowserSavePassword(
          values.username,
          values.password,
          redirectTo
        );
      } else {
        setTimeout(() => {
          window.location.href = redirectTo;
        }, 1000);
      }
    },
    onError: (error: unknown) => {
      form.resetFields(['password']);

      let errorMessage = 'Đăng nhập thất bại! Vui lòng thử lại.';

      try {
        const axiosError = error as {
          response?: {
            status: number;
            data?: {
              message?: string;
              error?: {
                message?: string;
                errors?: Record<string, string[]>;
              };
            };
          };
        };

        if (axiosError?.response) {
          const { status, data } = axiosError.response;

          switch (status) {
            case 401:
              errorMessage =
                data?.message || 'Số điện thoại hoặc mật khẩu không đúng!';
              break;
            case 403:
              errorMessage = data?.message || 'Bạn đã nghỉ việc!';
              break;
            case 422:
              if (data?.error?.errors) {
                const errors = Object.values(data.error.errors).flat();
                errorMessage =
                  errors.length > 0
                    ? errors[0]
                    : 'Thông tin đăng nhập không hợp lệ!';
              } else {
                errorMessage =
                  data?.error?.message ||
                  data?.message ||
                  'Thông tin đăng nhập không hợp lệ!';
              }
              break;
            case 429:
              errorMessage =
                'Bạn đã thực hiện quá nhiều lần đăng nhập. Vui lòng thử lại sau.';
              break;
            case 500:
              errorMessage = 'Lỗi hệ thống! Vui lòng thử lại sau.';
              break;
            default:
              errorMessage =
                data?.message ||
                data?.error?.message ||
                `Lỗi ${status}: Vui lòng thử lại.`;
          }
        } else if (error instanceof Error) {
          if (error.message.includes('Network Error')) {
            errorMessage =
              'Lỗi kết nối mạng! Vui lòng kiểm tra internet và thử lại.';
          } else {
            errorMessage = `Lỗi: ${error.message}`;
          }
        }
      } catch {
        errorMessage = 'Đăng nhập thất bại! Vui lòng thử lại.';
      }

      message.error(errorMessage);
    }
  });

  const lastValuesRef = useRef<FieldType | null>(null);

  const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
    if (isPending) return;
    lastValuesRef.current = values;
    loginMutation({
      username: values.username,
      password: values.password
    });
  };

  return (
    <div>
      <div className="mb-5 sm:mb-8">
        <h1 className="mb-2 text-3xl font-semibold text-gray-800 sm:text-4xl dark:text-white/90">
          Đăng Nhập
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Vui lòng nhập thông tin tài khoản để tiếp tục
        </p>
      </div>
      <div>
        <Form
          form={form}
          name="auth-login"
          onFinish={onFinish}
          layout="vertical"
          autoComplete="on"
        >
          <Form.Item<FieldType>
            name="username"
            rules={[
              { required: true, message: 'Vui lòng nhập tên đăng nhập!' }
            ]}
          >
            <Input
              placeholder="Số điện thoại hoặc tên đăng nhập"
              prefix={<FaRegUser />}
              disabled={isPending}
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item<FieldType>
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password
              placeholder="Mật khẩu"
              prefix={<IoLockClosedOutline />}
              disabled={isPending}
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              block
              type="primary"
              htmlType="submit"
              loading={isPending}
              disabled={isPending}
            >
              Đăng Nhập
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
