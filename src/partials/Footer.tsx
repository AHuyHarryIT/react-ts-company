import { Layout } from 'antd';
import { motion } from 'framer-motion';

const { Footer } = Layout;

export default function AppFooter() {
  return (
    <Footer className="!bg-transparent px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        whileHover={{ scale: 1.03 }}
        className="group flex cursor-pointer flex-col items-center justify-center gap-1.5 text-center select-none"
      >
        <motion.span
          whileHover={{ color: '#3b82f6' }}
          className="text-xs font-semibold tracking-widest text-gray-400 uppercase transition-colors duration-300 dark:text-gray-500"
        >
          &copy; {new Date().getFullYear()} VINH VINH PHAT ONE MEMBER CO.,LTD
        </motion.span>
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          whileInView={{ width: '30px', opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
          className="h-[2.5px] rounded-full bg-blue-500/40 transition-all duration-300 group-hover:w-[120px] group-hover:bg-blue-500 group-hover:shadow-[0_0_8px_rgba(59,130,246,0.6)]"
        />
      </motion.div>
    </Footer>
  );
}
