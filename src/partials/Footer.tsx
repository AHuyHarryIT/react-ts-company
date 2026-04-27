import { Layout } from 'antd';
import { motion } from 'framer-motion';
import VietnamFlag from '@components/holiday/VietnamFlag';
import { useHolidayMode } from '@hooks/useHolidayMode';

const { Footer } = Layout;

export default function AppFooter() {
  const { isHoliday } = useHolidayMode();

  return (
    <Footer className="!bg-transparent px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        whileHover={{ scale: 1.03 }}
        className="group flex cursor-pointer flex-col items-center justify-center gap-1.5 text-center select-none"
      >
        {/* Holiday decoration above copyright */}
        {isHoliday && (
          <div className="mb-2 flex items-center gap-3">
            <VietnamFlag size="xs" />
            <span
              className="text-[10px] font-bold tracking-widest uppercase"
              style={{
                background: 'linear-gradient(90deg, #da251d, #ffcd00)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Mừng Ngày Giải phóng 30/4 & Quốc tế Lao động 1/5
            </span>
            <VietnamFlag size="xs" />
          </div>
        )}

        <motion.span
          whileHover={{ color: isHoliday ? '#da251d' : '#3b82f6' }}
          className="text-xs font-semibold tracking-widest text-gray-400 uppercase transition-colors duration-300 dark:text-gray-500"
        >
          &copy; {new Date().getFullYear()} VINH VINH PHAT ONE MEMBER CO.,LTD
        </motion.span>

        <motion.div
          initial={{ width: 0, opacity: 0 }}
          whileInView={{ width: '30px', opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
          className={`h-[2.5px] rounded-full transition-all duration-300 ${
            isHoliday
              ? 'bg-red-500/40 group-hover:w-[120px] group-hover:bg-red-600 group-hover:shadow-[0_0_8px_rgba(218,37,29,0.6)]'
              : 'bg-blue-500/40 group-hover:w-[120px] group-hover:bg-blue-500 group-hover:shadow-[0_0_8px_rgba(59,130,246,0.6)]'
          }`}
        />
      </motion.div>
    </Footer>
  );
}
