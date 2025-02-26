import { Layout } from 'antd';

const { Footer } = Layout;

export default function AppFooter() {
  return (
    <Footer style={{ textAlign: 'center' }}>
      &copy; {new Date().getFullYear()}, VINH VINH PHAT ONE MEMBER CO.LID
    </Footer>
  );
}
