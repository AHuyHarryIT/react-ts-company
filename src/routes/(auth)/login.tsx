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
import logo from '@assets/images/logo/logoAsset.svg';

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
 * Strategy per browser engine:
 *
 * 1. Chrome/Edge (Credential Management API)
 *    → navigator.credentials.store() then redirect.
 *
 * 2. Safari desktop & iOS (no Credential Management API)
 *    → Safari detects password-save more reliably when the submission
 *      happens on a real, user-visible login form (not a detached/hidden form).
 *    → Re-submit the existing login form with username/password + proper
 *      autocomplete attributes to force a main-window navigation.
 *
 * 3. Firefox
 *    → same real-form submit fallback also works.
 */
const triggerBrowserSavePassword = (
  username: string,
  password: string,
  redirectTo: string
) => {
  // --- Modern API (Chrome 51+, Edge 79+, Android Chrome) ---
  if (window.PasswordCredential) {
    const PC = window.PasswordCredential;
    const cred = new PC({
      id: username,
      password: password
    });
    navigator.credentials
      .store(cred)
      .then(() => {
        window.location.href = redirectTo;
      })
      .catch(() => {
        window.location.href = redirectTo;
      });
    return;
  }

  // --- Safari / Firefox fallback: submit existing visible form ---
  const existingForm = document.getElementById(
    'auth-login-form'
  ) as HTMLFormElement | null;

  if (existingForm) {
    const usernameInput = existingForm.querySelector(
      'input[name="username"]'
    ) as HTMLInputElement | null;
    const passwordInput = existingForm.querySelector(
      'input[name="password"]'
    ) as HTMLInputElement | null;

    if (usernameInput) {
      usernameInput.value = username;
      usernameInput.autocomplete = 'username';
    }

    if (passwordInput) {
      passwordInput.value = password;
      passwordInput.autocomplete = 'current-password';
    }

    existingForm.method = 'POST';
    existingForm.action = redirectTo;
    existingForm.submit();
    return;
  }

  // Last fallback
  window.location.href = redirectTo;
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
    <div className="liquid-glass-card auth-glass-card flex min-w-0 flex-col items-center rounded-[28px] px-6 py-8 sm:px-8">
      {/* ── Logo ── */}
      <div className="mb-8">
        <img src={logo} alt="Logo" className="mx-auto h-28" />
      </div>

      {/* ── Title ── */}
      <div className="mb-6 text-center">
        <h1 className="mb-1 text-2xl font-bold text-black dark:text-white">
          Đăng Nhập
        </h1>
        <p className="text-sm text-black/40 dark:text-gray-500">
          Nhập thông tin tài khoản để tiếp tục
        </p>
      </div>

      {/* ── Form ── */}
      <div className="w-full min-w-0">
        <Form
          form={form}
          name="auth-login"
          id="auth-login-form"
          onFinish={onFinish}
          layout="vertical"
          autoComplete="on"
          className="space-y-1"
        >
          <Form.Item<FieldType>
            name="username"
            rules={[
              { required: true, message: 'Vui lòng nhập tên đăng nhập!' }
            ]}
          >
            <Input
              id="username"
              name="username"
              placeholder="Số điện thoại hoặc tên đăng nhập"
              prefix={<FaRegUser className="text-lg text-black/30" />}
              disabled={isPending}
              autoComplete="username"
              size="large"
              className="!rounded-xl !text-black placeholder:!text-black/30 hover:!border-gray-300 focus:!border-blue-400 dark:!text-white"
            />
          </Form.Item>

          <Form.Item<FieldType>
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password
              id="current-password"
              name="password"
              placeholder="Mật khẩu"
              prefix={<IoLockClosedOutline className="text-lg text-black/30" />}
              disabled={isPending}
              autoComplete="current-password"
              size="large"
              className="!rounded-xl !text-black placeholder:!text-black/30 hover:!border-gray-300 focus:!border-blue-400 dark:!text-white"
            />
          </Form.Item>

          <Form.Item className="!mt-4">
            <Button
              block
              type="primary"
              htmlType="submit"
              loading={isPending}
              disabled={isPending}
              size="large"
              className="liquid-glass-button glass-button !h-12 !rounded-xl !text-base !font-semibold active:!scale-[0.98]"
            >
              Đăng Nhập
            </Button>
          </Form.Item>
        </Form>
      </div>

      {/* ── Notice ── */}
      {/* <p className="mt-4 text-center text-xs leading-relaxed text-black/50 dark:text-gray-400">
        Khi đăng nhập thành công, trình duyệt sẽ hỏi bạn có muốn lưu mật khẩu.
        Nhấn{' '}
        <span className="inline-block rounded bg-black/5 px-1.5 py-0.5 font-bold text-black/70 dark:bg-white/10 dark:text-gray-200">
          "Lưu"
        </span>{' '}
        để đăng nhập nhanh hơn lần sau.
      </p> */}

      {/* ── Footer ── */}
      <p className="mt-6 text-center text-xs text-black/25 dark:text-gray-600">
        VINH VINH PHAT ONE MEMBER CO.,LTD
      </p>
    </div>
  );
}
