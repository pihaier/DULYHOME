import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ProductDetail } from '../types';

interface CartOptions {
  isCustomOrder: boolean;
  customOrderType: string;
  memo: string;
}

export function useCart() {
  const router = useRouter();
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartOptionsDialog, setCartOptionsDialog] = useState(false);
  const [cartOptions, setCartOptions] = useState<CartOptions>({
    isCustomOrder: false,
    customOrderType: '',
    memo: ''
  });

  const handleAddToCart = async (
    productDetail: ProductDetail,
    selectedSku: any,
    quantity: number
  ) => {
    // 옵션 선택 체크
    if (!productDetail) {
      alert('상품 정보가 없습니다.');
      return;
    }

    // SKU가 있는 상품인 경우 SKU 선택 확인
    if (productDetail.productSkuInfos && productDetail.productSkuInfos.length > 0) {
      if (!selectedSku) {
        alert('옵션을 선택해주세요.');
        return;
      }
    }

    // 최소 주문 수량 확인
    if (quantity < (productDetail.minOrderQuantity || 1)) {
      alert(`최소 주문 수량은 ${productDetail.minOrderQuantity || 1}개입니다.`);
      return;
    }

    setAddingToCart(true);

    try {
      // Supabase 세션 확인
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert('로그인이 필요합니다.');
        router.push('/login');
        return;
      }

      // 장바구니 데이터 준비
      const cartItem = {
        user_id: session.user.id,
        product_id: productDetail.offerId.toString(),
        product_name: productDetail.subjectTrans || productDetail.subject,
        product_image: productDetail.productImage?.images?.[0] || '',
        sku_id: selectedSku?.skuId || null,
        sku_attributes: selectedSku?.skuAttributes || null,
        quantity: quantity,
        unit_price: parseFloat(selectedSku?.promotionPrice || selectedSku?.price || productDetail.productSaleInfo?.priceRangeList?.[0]?.price || '0'),
        total_price: parseFloat(selectedSku?.promotionPrice || selectedSku?.price || productDetail.productSaleInfo?.priceRangeList?.[0]?.price || '0') * quantity,
        supplier_id: productDetail.sellerOpenId || productDetail.supplierUserId,
        supplier_name: productDetail.supplierLoginId,
        min_order_quantity: productDetail.minOrderQuantity,
        is_custom_order: cartOptions.isCustomOrder,
        custom_order_type: cartOptions.customOrderType,
        memo: cartOptions.memo
      };

      // 장바구니에 추가
      const { data, error } = await supabase
        .from('cart_items')
        .insert([cartItem])
        .select()
        .single();

      if (error) throw error;

      alert('장바구니에 추가되었습니다.');
      router.push('/dashboard/1688/cart');
      
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('장바구니 추가 중 오류가 발생했습니다.');
    } finally {
      setAddingToCart(false);
      setCartOptionsDialog(false);
    }
  };

  return {
    handleAddToCart,
    addingToCart,
    cartOptionsDialog,
    setCartOptionsDialog,
    cartOptions,
    setCartOptions
  };
}