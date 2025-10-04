import React, { useRef, useEffect, useState } from 'react';
import { Button, Space, message } from 'antd';
import { ClearOutlined, DownloadOutlined } from '@ant-design/icons';

interface SignaturePadProps {
  onSignatureChange?: (signatureDataURL: string | null) => void;
  width?: number;
  height?: number;
  penColor?: string;
  penWidth?: number;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  onSignatureChange,
  width = 400,
  height = 200,
  penColor = '#000000',
  penWidth = 2
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas background to white
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set drawing style
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
  }, [penColor, penWidth]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();

    setIsEmpty(false);

    // Update parent component with signature data
    const dataURL = canvas.toDataURL('image/png');
    onSignatureChange?.(dataURL);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas and set white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    setIsEmpty(true);
    onSignatureChange?.(null);
    message.success('Đã xóa chữ ký');
  };

  const downloadSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || isEmpty) {
      message.warning('Chưa có chữ ký để tải xuống');
      return;
    }

    const link = document.createElement('a');
    link.download = `signature_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    message.success('Đã tải xuống chữ ký');
  };

  return (
    <div className="signature-pad">
      <div className="mb-3">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="cursor-crosshair rounded border border-gray-300"
          style={{ touchAction: 'none' }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>
      <Space>
        <Button
          icon={<ClearOutlined />}
          onClick={clearSignature}
          disabled={isEmpty}
        >
          Xóa chữ ký
        </Button>
        <Button
          icon={<DownloadOutlined />}
          onClick={downloadSignature}
          disabled={isEmpty}
        >
          Tải xuống
        </Button>
      </Space>
      {/* <div className="text-xs text-gray-500 mt-2 text-center">
                Vẽ chữ ký của bạn trong khung trên
            </div> */}
    </div>
  );
};

export default SignaturePad;
