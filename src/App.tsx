import React, { useState, useEffect, useRef } from 'react';
import {
  Undo,
  Redo,
  Printer,
  PaintRoller,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Baseline,
  PaintBucket,
  Square,
  Merge,
  AlignLeft,
  AlignVerticalJustifyStart,
  WrapText,
  Link2,
  MessageSquare,
  Filter,
  Sigma,
  ChevronDown,
  Lock,
  CircleUser,
  FileSpreadsheet,
  Search,
  Check,
  Upload,
} from 'lucide-react';

const INITIAL_DATA = [
  {
    id: 1,
    text: 'Sáng nay, cậu tỉnh dậy trong một căn phòng xa lạ.',
    progress: 100,
    date: '01/10/2024',
  },
  {
    id: 2,
    text: 'Ngoài cửa sổ, thành phố vẫn ồn ào như mọi ngày.',
    progress: 100,
    date: '01/10/2024',
  },
  {
    id: 3,
    text: 'Trên bàn là một tờ giấy, nét chữ quen thuộc.',
    progress: 100,
    date: '02/10/2024',
  },
  {
    id: 4,
    text: 'Nó chỉ vỏn vẹn vài dòng, nhưng khiến tim cậu chùng lại.',
    progress: 80,
    date: '02/10/2024',
  },
  {
    id: 5,
    text: 'Cậu không nhớ rõ chuyện gì đã xảy ra tối qua.',
    progress: 60,
    date: '03/10/2024',
  },
  {
    id: 6,
    text: 'Chỉ biết trong đầu là những mảnh ký ức rời rạc.',
    progress: 60,
    date: '03/10/2024',
  },
  {
    id: 7,
    text: 'Cậu đứng dậy, bước đến chiếc gương trong phòng tắm.',
    progress: 40,
    date: '04/10/2024',
  },
  {
    id: 8,
    text: 'Người trong gương vẫn là cậu, nhưng ánh mắt có gì đó khác.',
    progress: 40,
    date: '04/10/2024',
  },
  {
    id: 9,
    text: 'Điện thoại rung lên, một tin nhắn lạ.',
    progress: 40,
    date: '05/10/2024',
  },
  {
    id: 10,
    text: '"Chúng ta cần nói chuyện."',
    progress: 60,
    date: '05/10/2024',
  },
  {
    id: 11,
    text: 'Cậu nhìn ra cửa sổ, bầu trời hôm nay trong hơn.',
    progress: 80,
    date: '06/10/2024',
  },
  {
    id: 12,
    text: 'Nhưng linh cảm nói với cậu, mọi chuyện sẽ không đơn giản như vậy.',
    progress: 80,
    date: '06/10/2024',
  },
  {
    id: 13,
    text: 'Ở đâu đó trong thành phố này, vẫn còn những bí mật chưa được kể ra.',
    progress: 20,
    date: '07/10/2024',
  },
  {
    id: 14,
    text: 'Và cậu, có lẽ, đã vô tình trở thành một phần của nó.',
    progress: 20,
    date: '07/10/2024',
  },
];

export default function App() {
  const [data, setData] = useState(INITIAL_DATA);
  const [activeCell, setActiveCell] = useState({ r: 0, c: 'B' }); // r is index in data array
  const [formulaText, setFormulaText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [title, setTitle] = useState('Báo cáo dự án - Tháng 10');

  const activeCellRef = useRef(null);

  // Sync formula bar with active cell content
  useEffect(() => {
    if (activeCell.r >= 0 && activeCell.r < data.length) {
      const row = data[activeCell.r];
      let val = '';
      if (activeCell.c === 'A') val = (activeCell.r + 1).toString();
      if (activeCell.c === 'B') val = row.text;
      if (activeCell.c === 'C') val = `${row.progress}%`;
      if (activeCell.c === 'D') val = row.date;
      setFormulaText(val);
    }
  }, [activeCell, data]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't interfere if typing in modal or actual inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')
        return;

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault(); // Prevent page scroll

        setActiveCell((prev) => {
          let newR = prev.r;
          let newC = prev.c;
          const cols = ['A', 'B', 'C', 'D'];
          const cIndex = cols.indexOf(prev.c);

          if (e.key === 'ArrowUp' && prev.r > 0) newR = prev.r - 1;
          if (e.key === 'ArrowDown' && prev.r < data.length - 1)
            newR = prev.r + 1;
          if (e.key === 'ArrowLeft' && cIndex > 0) newC = cols[cIndex - 1];
          if (e.key === 'ArrowRight' && cIndex < cols.length - 1)
            newC = cols[cIndex + 1];

          return { r: newR, c: newC };
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [data.length]);

  // Scroll active cell into view seamlessly
  useEffect(() => {
    if (activeCellRef.current) {
      activeCellRef.current.scrollIntoView({
        behavior: 'auto',
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }, [activeCell]);

  // Core logic to process raw text into fake sheet rows
  const processImportedText = (text) => {
    if (!text.trim()) {
      setIsModalOpen(false);
      return;
    }

    // Split by newlines or rough sentence boundaries
    let lines = text.split('\n').filter((l) => l.trim().length > 0);
    if (lines.length === 1) {
      // Fallback if it's one giant paragraph: split by periods
      lines = text.match(/[^.!?]+[.!?]+/g) || [text];
    }

    const newData = lines.map((line, index) => {
      const progressOpts = [20, 40, 60, 80, 100];
      const randomProgress =
        progressOpts[Math.floor(Math.random() * progressOpts.length)];

      const d = new Date();
      d.setDate(d.getDate() + index);
      const dateStr = `${d.getDate().toString().padStart(2, '0')}/${(
        d.getMonth() + 1
      )
        .toString()
        .padStart(2, '0')}/${d.getFullYear()}`;

      return {
        id: index + 1,
        text: line.trim(),
        progress: randomProgress,
        date: dateStr,
      };
    });

    setData(newData);
    setActiveCell({ r: 0, c: 'B' });
    setIsModalOpen(false);
    setImportText('');
  };

  const handleImport = () => {
    processImportedText(importText);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      processImportedText(text);
    };
    reader.readAsText(file);
  };

  const getProgressColor = (percent) => {
    if (percent === 100) return 'bg-[#34a853]'; // Google Green
    if (percent >= 60) return 'bg-[#4285f4]'; // Google Blue
    if (percent === 40) return 'bg-[#fbbc04]'; // Google Yellow
    return 'bg-[#e8eaed]'; // Light gray for low progress
  };

  const menuItems = [
    'Tệp',
    'Chỉnh sửa',
    'Xem',
    'Chèn',
    'Định dạng',
    'Dữ liệu',
    'Công cụ',
    'Tiện ích',
    'Trợ giúp',
  ];

  return (
    <div className="flex flex-col h-screen bg-white font-sans text-[13px] text-gray-800 overflow-hidden select-none">
      {/* Top Header */}
      <header className="flex items-center justify-between px-2 py-1.5 border-b border-gray-200 bg-[#f8f9fa]">
        <div className="flex items-center gap-2">
          <div className="p-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              className="w-9 h-9"
            >
              <path
                fill="#4CAF50"
                d="M41,10H25v28h16c0.553,0,1-0.447,1-1V11C42,10.447,41.553,10,41,10z"
              />
              <path fill="#388E3C" d="M25,10h-9v28h9V10z" />
              <path
                fill="#4CAF50"
                d="M16,38H7c-0.553,0-1-0.447-1-1V11c0-0.553,0.447-1,1-1h9V38z"
              />
              <path
                fill="#FFF"
                d="M14,15h20v2H14V15z M14,21h20v2H14V21z M14,27h20v2H14V27z M14,33h10v2H14V33z"
              />
            </svg>
          </div>
          <div className="flex flex-col -mt-1">
            <div
              className="text-lg font-medium text-gray-800 px-1 py-0.5 rounded hover:border-gray-300 border border-transparent cursor-text inline-block max-w-fit"
              onDoubleClick={() => setIsModalOpen(true)}
              title="Double click to import custom story"
            >
              {title}
            </div>
            <div className="flex text-[13px] text-gray-600 space-x-1">
              {menuItems.map((item) => (
                <div
                  key={item}
                  className="px-2 py-0.5 hover:bg-gray-200 rounded cursor-pointer"
                  onClick={() => {
                    // Mở bảng chọn truyện khi click vào "Tệp" hoặc "Tiện ích"
                    if (item === 'Tiện ích' || item === 'Tệp') {
                      setIsModalOpen(true);
                    }
                  }}
                  title={
                    item === 'Tiện ích' || item === 'Tệp'
                      ? 'Click để thêm truyện'
                      : ''
                  }
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 pr-2">
          <Search className="w-5 h-5 text-gray-600 cursor-pointer" />
          <button className="flex items-center gap-2 bg-[#c2e7ff] hover:bg-[#b3dcf4] text-[#001d35] px-4 py-2 rounded-full font-medium text-sm transition-colors">
            <Lock className="w-4 h-4" />
            Chia sẻ
          </button>
          <CircleUser className="w-8 h-8 text-gray-500 cursor-pointer" />
        </div>
      </header>

      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1 bg-[#edf2fa] border-b border-gray-300 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <Undo className="w-4 h-4 text-gray-600 mx-1 cursor-pointer" />
        <Redo className="w-4 h-4 text-gray-400 mx-1 cursor-pointer" />
        <Printer className="w-4 h-4 text-gray-600 mx-1 cursor-pointer" />
        <PaintRoller className="w-4 h-4 text-gray-600 mx-1 cursor-pointer" />
        <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>
        <div className="flex items-center mx-1 cursor-pointer">
          <span className="text-gray-700">100%</span>
          <ChevronDown className="w-3 h-3 text-gray-600 ml-1" />
        </div>
        <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>
        <div className="flex items-center mx-1 cursor-pointer w-20">
          <span className="text-gray-700 font-sans">Arial</span>
          <ChevronDown className="w-3 h-3 text-gray-600 ml-auto" />
        </div>
        <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>
        <div className="flex items-center mx-1 cursor-pointer">
          <span className="text-gray-700">11</span>
          <ChevronDown className="w-3 h-3 text-gray-600 ml-1" />
        </div>
        <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>
        <Bold className="w-4 h-4 text-gray-600 mx-1 cursor-pointer" />
        <Italic className="w-4 h-4 text-gray-600 mx-1 cursor-pointer" />
        <Strikethrough className="w-4 h-4 text-gray-600 mx-1 cursor-pointer" />
        <Baseline className="w-4 h-4 text-gray-600 mx-1 cursor-pointer" />
        <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>
        <PaintBucket className="w-4 h-4 text-gray-600 mx-1 cursor-pointer" />
        <Square className="w-4 h-4 text-gray-600 mx-1 cursor-pointer" />
        <Merge className="w-4 h-4 text-gray-600 mx-1 cursor-pointer" />
        <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>
        <AlignLeft className="w-4 h-4 text-gray-600 mx-1 cursor-pointer" />
        <AlignVerticalJustifyStart className="w-4 h-4 text-gray-600 mx-1 cursor-pointer" />
        <WrapText className="w-4 h-4 text-gray-600 mx-1 cursor-pointer" />
        <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>
        <Link2 className="w-4 h-4 text-gray-600 mx-1 cursor-pointer" />
        <MessageSquare className="w-4 h-4 text-gray-600 mx-1 cursor-pointer" />
        <Filter className="w-4 h-4 text-gray-600 mx-1 cursor-pointer" />
        <Sigma className="w-4 h-4 text-gray-600 mx-1 cursor-pointer" />
      </div>

      {/* Formula Bar */}
      <div className="flex items-center px-2 py-1 border-b border-gray-300 bg-white">
        <div className="font-serif italic text-gray-400 font-bold px-2 border-r border-gray-300 flex-shrink-0">
          fx
        </div>
        <input
          type="text"
          className="flex-1 ml-2 outline-none text-[13px] font-sans bg-transparent"
          value={formulaText}
          readOnly
        />
      </div>

      {/* Grid Area */}
      <div
        className="flex-1 overflow-auto bg-gray-100 flex flex-col relative"
        id="grid-container"
      >
        {/* Sticky Columns Header (A, B, C, D) */}
        <div className="flex sticky top-0 z-20 bg-gray-100 border-b border-gray-300 text-gray-600 font-normal">
          <div className="w-10 min-w-[40px] border-r border-gray-300 bg-gray-100 sticky left-0 z-30"></div>
          <div className="w-[50px] min-w-[50px] border-r border-gray-300 text-center py-0.5 bg-gray-100">
            A
          </div>
          <div className="w-[600px] min-w-[400px] border-r border-gray-300 text-center py-0.5 bg-gray-100 flex-1">
            B
          </div>
          <div className="w-[120px] min-w-[120px] border-r border-gray-300 text-center py-0.5 bg-gray-100">
            C
          </div>
          <div className="w-[150px] min-w-[150px] border-r border-gray-300 text-center py-0.5 bg-gray-100">
            D
          </div>
        </div>

        {/* Data Headers Row (Visually Row 1 in custom format) */}
        <div className="flex border-b border-gray-300 font-bold bg-[#e6f4ea] text-gray-800">
          <div className="w-10 min-w-[40px] border-r border-gray-300 bg-gray-100 text-center py-1 text-gray-500 font-normal sticky left-0 z-10"></div>
          <div className="w-[50px] min-w-[50px] border-r border-gray-300 px-2 py-1 text-center border-b-2 border-b-[#1a73e8]">
            STT
          </div>
          <div className="w-[600px] min-w-[400px] border-r border-gray-300 px-2 py-1 flex-1">
            Báo cáo nội dung
          </div>
          <div className="w-[120px] min-w-[120px] border-r border-gray-300 px-2 py-1 text-center">
            Tiến độ
          </div>
          <div className="w-[150px] min-w-[150px] border-r border-gray-300 px-2 py-1 text-center">
            Ngày cập nhật
          </div>
        </div>

        {/* Render Data Rows */}
        {data.map((row, rowIndex) => (
          <div
            key={row.id}
            className="flex border-b border-gray-200 bg-white group"
          >
            {/* Row Number */}
            <div className="w-10 min-w-[40px] border-r border-gray-300 bg-gray-100 text-center py-1 text-gray-500 sticky left-0 z-10 group-hover:bg-gray-200">
              {rowIndex + 1}
            </div>

            {/* Column A: STT */}
            <div
              className={`w-[50px] min-w-[50px] border-r border-gray-200 px-2 py-1 text-center text-gray-600 relative cursor-cell
                ${
                  activeCell.r === rowIndex && activeCell.c === 'A'
                    ? 'outline outline-2 outline-[#1a73e8] outline-offset-[-2px] z-10 bg-[#e8f0fe]'
                    : ''
                }`}
              onClick={() => setActiveCell({ r: rowIndex, c: 'A' })}
              ref={
                activeCell.r === rowIndex && activeCell.c === 'A'
                  ? activeCellRef
                  : null
              }
            >
              {row.id}
            </div>

            {/* Column B: Content (The Story) */}
            <div
              className={`w-[600px] min-w-[400px] border-r border-gray-200 px-2 py-1 truncate relative cursor-cell flex-1
                ${
                  activeCell.r === rowIndex && activeCell.c === 'B'
                    ? 'outline outline-2 outline-[#1a73e8] outline-offset-[-2px] z-10 bg-white'
                    : ''
                }`}
              onClick={() => setActiveCell({ r: rowIndex, c: 'B' })}
              ref={
                activeCell.r === rowIndex && activeCell.c === 'B'
                  ? activeCellRef
                  : null
              }
            >
              {row.text}
            </div>

            {/* Column C: Progress */}
            <div
              className={`w-[120px] min-w-[120px] border-r border-gray-200 px-2 py-1 relative cursor-cell flex items-center justify-between
                ${
                  activeCell.r === rowIndex && activeCell.c === 'C'
                    ? 'outline outline-2 outline-[#1a73e8] outline-offset-[-2px] z-10 bg-white'
                    : ''
                }`}
              onClick={() => setActiveCell({ r: rowIndex, c: 'C' })}
              ref={
                activeCell.r === rowIndex && activeCell.c === 'C'
                  ? activeCellRef
                  : null
              }
            >
              <div
                className={`h-4 w-12 rounded-sm ${getProgressColor(
                  row.progress
                )}`}
              ></div>
              <span className="text-gray-600">{row.progress}%</span>
            </div>

            {/* Column D: Date */}
            <div
              className={`w-[150px] min-w-[150px] border-r border-gray-200 px-2 py-1 text-center text-gray-600 relative cursor-cell
                ${
                  activeCell.r === rowIndex && activeCell.c === 'D'
                    ? 'outline outline-2 outline-[#1a73e8] outline-offset-[-2px] z-10 bg-white'
                    : ''
                }`}
              onClick={() => setActiveCell({ r: rowIndex, c: 'D' })}
              ref={
                activeCell.r === rowIndex && activeCell.c === 'D'
                  ? activeCellRef
                  : null
              }
            >
              {row.date}
            </div>
          </div>
        ))}

        {/* Empty Padding Rows */}
        {[...Array(20)].map((_, i) => (
          <div
            key={`empty-${i}`}
            className="flex border-b border-gray-200 bg-white"
          >
            <div className="w-10 min-w-[40px] border-r border-gray-300 bg-gray-100 text-center py-1 text-gray-500 sticky left-0 z-10">
              {data.length + i + 1}
            </div>
            <div className="w-[50px] min-w-[50px] border-r border-gray-200"></div>
            <div className="w-[600px] min-w-[400px] border-r border-gray-200 flex-1 h-[25px]"></div>
            <div className="w-[120px] min-w-[120px] border-r border-gray-200"></div>
            <div className="w-[150px] min-w-[150px] border-r border-gray-200"></div>
          </div>
        ))}
      </div>

      {/* Secret Modal for Importing Story */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col h-[70vh]">
            <div className="px-4 py-3 border-b flex justify-between items-center bg-[#f8f9fa] rounded-t-lg">
              <h2 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                <Upload className="w-5 h-5 text-gray-600" />
                Nhập dữ liệu bí mật
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="p-4 flex-1 flex flex-col gap-4 overflow-auto">
              {/* Option 1: File Upload */}
              <div className="border border-gray-200 rounded p-4 bg-gray-50">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Cách 1: Tải lên file truyện (.txt)
                </p>
                <input
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-medium
                    file:bg-[#e8f0fe] file:text-[#1a73e8]
                    hover:file:bg-[#d2e3fc] cursor-pointer"
                />
              </div>

              {/* Option 2: Text Paste */}
              <div className="flex-1 flex flex-col">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Cách 2: Dán trực tiếp văn bản
                </p>
                <textarea
                  className="flex-1 w-full border border-gray-300 rounded p-3 text-sm focus:outline-none focus:border-[#1a73e8] resize-none"
                  placeholder="Dán toàn bộ nội dung truyện của bạn vào đây..."
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                />
              </div>
            </div>

            <div className="px-4 py-3 border-t bg-gray-50 rounded-b-lg flex justify-end gap-2">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                onClick={() => setIsModalOpen(false)}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-[#1a73e8] rounded hover:bg-[#1557b0]"
                onClick={handleImport}
              >
                Chuyển đổi dữ liệu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
