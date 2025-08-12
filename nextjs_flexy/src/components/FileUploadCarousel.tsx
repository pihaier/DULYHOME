'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import useEmblaCarousel from 'embla-carousel-react';
import clsx from 'clsx';
import {
  DocumentIcon,
  DocumentTextIcon,
  DocumentArrowDownIcon,
  PhotoIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface FileUploadCarouselProps {
  onFilesChange: (files: File[]) => void;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  label: string;
  description?: string;
  required?: boolean;
  error?: string;
  currentFiles?: File[];
}

export default function FileUploadCarousel({
  onFilesChange,
  accept = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/webp': ['.webp'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
  },
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  label,
  description,
  required = false,
  error,
  currentFiles = []
}: FileUploadCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState<string>('');
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // 파일 타입 확인
  const getFileType = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
    const pdfExts = ['pdf'];
    const docExts = ['doc', 'docx'];
    const excelExts = ['xls', 'xlsx'];
    
    if (imageExts.includes(ext || '')) return 'image';
    if (pdfExts.includes(ext || '')) return 'pdf';
    if (docExts.includes(ext || '')) return 'word';
    if (excelExts.includes(ext || '')) return 'excel';
    return 'file';
  };

  // 파일 변경 시 미리보기 URL 생성
  useEffect(() => {
    // 기존 URL 정리
    previewUrls.forEach(url => {
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });

    // 새로운 URL 생성
    const newUrls = currentFiles.map((file) => {
      if (getFileType(file.name) === 'image') {
        return URL.createObjectURL(file);
      }
      return '';
    });

    setPreviewUrls(newUrls);

    // Cleanup
    return () => {
      newUrls.forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [currentFiles]);

  // Dropzone 설정
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = [...currentFiles, ...acceptedFiles];
    if (newFiles.length > maxFiles) {
      alert(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`);
      return;
    }
    onFilesChange(newFiles);
    
    // 새로 추가된 파일로 이동
    setTimeout(() => {
      emblaApi?.scrollTo(currentFiles.length);
    }, 100);
  }, [currentFiles, maxFiles, onFilesChange, emblaApi]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: true
  });

  // 파일 삭제
  const removeFile = (index: number) => {
    const newFiles = currentFiles.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  // 파일 다운로드
  const downloadFile = (file: File) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // 파일 타입별 아이콘
  const getFileIcon = (fileType: string, className: string = "w-24 h-24") => {
    switch (fileType) {
      case 'pdf':
        return (
          <div className="text-red-600">
            <DocumentIcon className={className} />
            <span className="text-xs font-medium mt-2 block">PDF</span>
          </div>
        );
      case 'word':
        return (
          <div className="text-blue-600">
            <DocumentTextIcon className={className} />
            <span className="text-xs font-medium mt-2 block">Word</span>
          </div>
        );
      case 'excel':
        return (
          <div className="text-green-600">
            <DocumentIcon className={className} />
            <span className="text-xs font-medium mt-2 block">Excel</span>
          </div>
        );
      default:
        return (
          <div className="text-gray-500">
            <DocumentArrowDownIcon className={className} />
            <span className="text-xs font-medium mt-2 block">파일</span>
          </div>
        );
    }
  };

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi]);

  const showPrevNext = currentFiles.length > 0;

  return (
    <>
      <div className="w-full">
        <label className="text-base/7 font-semibold text-neutral-950 data-[disabled]:opacity-50">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {description && (
          <p className="mt-1 text-sm/6 text-neutral-600">{description}</p>
        )}

        <div className="mt-4">
          {currentFiles.length === 0 ? (
            // 파일이 없을 때는 드롭존만 표시
            <div
              {...getRootProps()}
              className={clsx(
                'flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors',
                isDragActive
                  ? 'border-neutral-400 bg-neutral-50'
                  : 'border-neutral-300 hover:border-neutral-400',
                error && 'border-red-500'
              )}
            >
              <input {...getInputProps()} />
              <div className="text-center">
                <PhotoIcon className="mx-auto h-12 w-12 text-neutral-400" />
                <p className="mt-2 text-sm font-semibold text-neutral-900">
                  {isDragActive ? '여기에 파일을 놓으세요' : '클릭하거나 파일을 드래그하세요'}
                </p>
                <p className="text-xs text-neutral-500">
                  최대 {maxFiles}개, 각 {maxSize / 1024 / 1024}MB 이하
                </p>
              </div>
            </div>
          ) : (
            // 파일이 있을 때는 캐러셀 표시
            <div className="relative">
              <div className="overflow-hidden rounded-lg" ref={emblaRef}>
                <div className="flex">
                  {currentFiles.map((file, index) => {
                    const fileType = getFileType(file.name);
                    const isImage = fileType === 'image';
                    
                    return (
                      <div key={index} className="flex-[0_0_100%] min-w-0">
                        <div className="relative bg-gray-100 rounded-lg flex items-center justify-center" style={{ height: '200px' }}>
                          {isImage && previewUrls[index] ? (
                            <img
                              src={previewUrls[index]}
                              alt={file.name}
                              className="max-w-full max-h-full object-contain cursor-pointer p-2"
                              style={{ maxHeight: '180px' }}
                              onClick={() => {
                                setModalImage(previewUrls[index]);
                                setShowModal(true);
                              }}
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center p-8">
                              {getFileIcon(fileType, "w-32 h-32")}
                              <p className="mt-4 text-sm text-gray-600 text-center max-w-xs truncate">
                                {file.name}
                              </p>
                              <button
                                type="button"
                                onClick={() => downloadFile(file)}
                                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                              >
                                <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                                다운로드
                              </button>
                            </div>
                          )}
                          
                          {/* 삭제 버튼 */}
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* 추가 버튼 슬라이드 */}
                  {currentFiles.length < maxFiles && (
                    <div className="flex-[0_0_100%] min-w-0">
                      <div
                        {...getRootProps()}
                        className="relative bg-gray-50 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors border-2 border-dashed border-gray-300"
                        style={{ height: '200px' }}
                      >
                        <input {...getInputProps()} />
                        <div className="text-center">
                          <PlusIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-2 text-sm font-semibold text-gray-600">
                            파일 추가
                          </p>
                          <p className="text-xs text-gray-500">
                            {maxFiles - currentFiles.length}개 더 추가 가능
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation Buttons */}
              {(showPrevNext || currentFiles.length < maxFiles) && (
                <>
                  <button
                    type="button"
                    onClick={scrollPrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                    aria-label="이전 파일"
                  >
                    <ChevronLeftIcon className="w-6 h-6" />
                  </button>
                  <button
                    type="button"
                    onClick={scrollNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                    aria-label="다음 파일"
                  >
                    <ChevronRightIcon className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* 파일 개수 표시 */}
        {currentFiles.length > 0 && (
          <p className="mt-2 text-sm text-gray-600">
            {currentFiles.length}/{maxFiles} 파일 업로드됨
          </p>
        )}

        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>

      {/* 이미지 모달 */}
      {showModal && modalImage && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <img
              src={modalImage}
              alt="확대 이미지"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full hover:bg-black/70 transition-colors"
              aria-label="닫기"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}