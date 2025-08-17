# 关键词搜索

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /alibaba/product/keywordQuery:
    get:
      summary: 关键词搜索
      deprecated: false
      description: >-
        请提交中文的keyword进行搜索，支持返回多语言商品详情，开通多语言，请联系客服，英语："en", 俄语："ru", 越语： "vi",
        日语："ja", 韩语： "ko", 法语："fr", 葡萄牙语："pt", 西班牙语： "es"，泰语："th",
        印尼语："id"，阿拉伯语："ar"，法语："fr"
      tags:
        - 接口说明/1688 API/1688 商品搜索
      parameters:
        - name: appKey
          in: query
          description: 大吉平台appKey
          required: true
          example: ''
          schema:
            type: string
        - name: appSecret
          in: query
          description: 秘钥，仅调试使用，正式用sign签名
          required: false
          example: ''
          schema:
            type: string
        - name: sign
          in: query
          description: sign签名，请求的参数字典排序+秘钥appSecret，调试时可忽略改字段
          required: false
          schema:
            type: string
        - name: keyword
          in: query
          description: 请使用中文关键词，如果是非中文请自行翻译
          required: true
          example: 连衣裙
          schema:
            type: string
        - name: beginPage
          in: query
          description: 分页
          required: true
          example: 1
          schema:
            type: integer
        - name: pageSize
          in: query
          description: 分页，最大不超过50，建议20效果最佳
          required: true
          example: 20
          schema:
            type: integer
        - name: filter
          in: query
          description: 筛选参数，多个通过英文逗号分隔，枚举见开发人员参考
          required: false
          example: shipInToday,ksCiphertext
          schema:
            type: string
        - name: sort
          in: query
          description: 排序参数，枚举见开发人员参考
          required: false
          example: '{"price":"asc"}'
          schema:
            type: string
        - name: outMemberId
          in: query
          description: 外部用户id
          required: false
          example:
            - '123'
          schema:
            type: array
            items:
              type: string
        - name: priceStart
          in: query
          description: 批发价开始
          required: false
          example: '1'
          schema:
            type: string
        - name: priceEnd
          in: query
          description: 批发价结束
          required: false
          example: '20000'
          schema:
            type: string
        - name: categoryId
          in: query
          description: 类目id
          required: false
          schema:
            type: integer
        - name: country
          in: query
          description: 如en-英语，枚举见开发人员参考
          required: true
          example: en
          schema:
            type: string
        - name: regionOpp
          in: query
          description: 商机货盘
          required: false
          example: ''
          schema:
            type: string
        - name: productCollectionId
          in: query
          description: 寻源通工作台货盘id
          required: false
          example: ''
          schema:
            type: string
        - name: snId
          in: query
          description: 搜索导航ID，如978或978:1352
          required: false
          example: ''
          schema:
            type: string
      responses:
        '200':
          description: ''
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: integer
                    description: 返回码
                  message:
                    type: string
                    description: 消息
                  data:
                    type: object
                    properties:
                      totalRecords:
                        type: integer
                        description: 总条数
                      totalPage:
                        type: integer
                        description: 总页码
                      pageSize:
                        type: integer
                        description: 分页
                      currentPage:
                        type: integer
                        description: 分页
                      data:
                        type: array
                        items:
                          type: object
                          properties:
                            imageUrl:
                              type: string
                              description: 图片地址
                            subject:
                              type: string
                              description: "中文标题\t"
                            subjectTrans:
                              type: string
                              description: 外文标题
                            offerId:
                              type: integer
                              description: 商品ID
                            isJxhy:
                              type: boolean
                              description: 是否精选货源
                            priceInfo:
                              type: object
                              properties:
                                price:
                                  type: string
                                  description: 批发价
                                jxhyPrice:
                                  type: string
                                  description: 代发精选货源价
                                  nullable: true
                                pfJxhyPrice:
                                  type: string
                                  description: 批发精选货源价
                                  nullable: true
                                consignPrice:
                                  type: string
                                  description: 一件代发价
                              required:
                                - price
                                - jxhyPrice
                                - pfJxhyPrice
                                - consignPrice
                              x-apifox-orders:
                                - price
                                - jxhyPrice
                                - pfJxhyPrice
                                - consignPrice
                              description: 价格
                            repurchaseRate:
                              type: string
                              description: 复购率
                            monthSold:
                              type: integer
                              description: 30天销量
                            traceInfo:
                              type: string
                              description: 向1688上报打点数据
                            isOnePsale:
                              type: boolean
                              description: 是否一件代发
                            sellerIdentities:
                              type: array
                              items:
                                type: string
                              description: 商家身份
                          required:
                            - imageUrl
                            - subject
                            - subjectTrans
                            - offerId
                            - isJxhy
                            - priceInfo
                            - repurchaseRate
                            - monthSold
                            - traceInfo
                            - isOnePsale
                            - sellerIdentities
                          x-apifox-orders:
                            - imageUrl
                            - subject
                            - subjectTrans
                            - offerId
                            - isJxhy
                            - priceInfo
                            - repurchaseRate
                            - monthSold
                            - traceInfo
                            - isOnePsale
                            - sellerIdentities
                        description: 业务数据
                    required:
                      - totalRecords
                      - totalPage
                      - pageSize
                      - currentPage
                      - data
                    x-apifox-orders:
                      - totalRecords
                      - totalPage
                      - pageSize
                      - currentPage
                      - data
                    description: 业务数据
                  timestamp:
                    type: integer
                    description: 时间戳
                  traceId:
                    type: string
                    description: traceId
                required:
                  - code
                  - message
                  - data
                  - timestamp
                  - traceId
                x-apifox-orders:
                  - code
                  - message
                  - data
                  - timestamp
                  - traceId
              example:
                code: 200
                message: 操作成功
                data:
                  totalRecords: 2000
                  totalPage: 101
                  pageSize: 20
                  currentPage: 1
                  data:
                    - imageUrl: >-
                        https://cbu01.alicdn.com/img/ibank/O1CN01NloCL81gMDUgWvK09_!!2217487514127-0-cib.jpg
                      subject: 厂家供应各种型号电动三轮车轮胎300-10 14x250真空胎
                      subjectTrans: >-
                        Производители поставляют различные типы электрических
                        трехколесных Шин 300-10 14x250 вакуумных шин
                      offerId: 769649076522
                      isJxhy: false
                      priceInfo:
                        price: '12.00'
                        jxhyPrice: null
                        pfJxhyPrice: null
                        consignPrice: '12.00'
                      repurchaseRate: 20%
                      monthSold: 2456
                      traceInfo: >-
                        object_id%40769649076522%5Eobject_type%40offer%5Etrace%40212bbbe717207772685005064e1487%5Ekeyword%40%E8%BD%AE%E8%83%8E%5EoutMemberId%40null
                      isOnePsale: true
                      sellerIdentities:
                        - tp_member
                    - imageUrl: >-
                        https://cbu01.alicdn.com/img/ibank/O1CN01e1myNH1urjOUpFEHK_!!2460476091-0-cib.jpg
                      subject: 拖拉机轮胎600-12 14 650 750-16 8.3 9.5 11.2-20-24人字农用胎
                      subjectTrans: >-
                        Трактор шин 600-12 14 650 750-16 8,3 9, 5 11,2-20-24
                        елочка сельскохозяйственных шин
                      offerId: 595616270337
                      isJxhy: false
                      priceInfo:
                        price: '140.00'
                        jxhyPrice: null
                        pfJxhyPrice: null
                        consignPrice: '140.0'
                      repurchaseRate: 0%
                      monthSold: 36
                      traceInfo: >-
                        object_id%40595616270337%5Eobject_type%40offer%5Etrace%40212bbbe717207772685005064e1487%5Ekeyword%40%E8%BD%AE%E8%83%8E%5EoutMemberId%40null
                      isOnePsale: true
                      sellerIdentities:
                        - tp_member
                    - imageUrl: >-
                        https://cbu01.alicdn.com/img/ibank/O1CN01A7Koln1N2XftLSBwa_!!2215430061512-0-cib.jpg
                      subject: 正品东岳自行车轮胎12/14/16/18/20/22/24/26寸 山地车童车外胎
                      subjectTrans: >-
                        Оригинальные товары Dongyue велосипедная шина
                        12/14/16/18/20/22/24/26 дюймов шина для коляски горного
                        велосипеда
                      offerId: 708555248133
                      isJxhy: true
                      priceInfo:
                        price: '6.90'
                        jxhyPrice: '6.90'
                        pfJxhyPrice: '6.9'
                        consignPrice: '6.90'
                      repurchaseRate: 30%
                      monthSold: 8444
                      traceInfo: >-
                        object_id%40708555248133%5Eobject_type%40offer%5Etrace%40212bbbe717207772685005064e1487%5Ekeyword%40%E8%BD%AE%E8%83%8E%5EoutMemberId%40null
                      isOnePsale: true
                      sellerIdentities:
                        - tp_member
                    - imageUrl: >-
                        https://nhci-aigc.oss-cn-zhangjiakou.aliyuncs.com/ppc-records%2Fimage-translation%2Fea7b0f7e-c8e9-11ee-a9cb-00163e0a693f.png?OSSAccessKeyId=LTAI5tCv9DpB7gYic1oGsAyv&Expires=4924333749&Signature=KyP3KsfB8MRWl2585SkKbvYmcgo%3D
                      subject: 12 1/2*2 1/4电瓶车轮胎57-203电动轮椅车内外胎62-203充气轮胎
                      subjectTrans: >-
                        12 1/2*2 1/4 аккумуляторная автомобильная шина 57-203
                        электрическая инвалидная коляска внутренняя и внешняя
                        шина 62-203 пневматическая шина
                      offerId: 573381972600
                      isJxhy: false
                      priceInfo:
                        price: '7.00'
                        jxhyPrice: null
                        pfJxhyPrice: null
                        consignPrice: '7.00'
                      repurchaseRate: 44%
                      monthSold: 7735
                      traceInfo: >-
                        object_id%40573381972600%5Eobject_type%40offer%5Etrace%40212bbbe717207772685005064e1487%5Ekeyword%40%E8%BD%AE%E8%83%8E%5EoutMemberId%40null
                      isOnePsale: true
                      sellerIdentities:
                        - tp_member
                    - imageUrl: >-
                        https://cbu01.alicdn.com/img/ibank/O1CN01ntHErS1YarC2jmWue_!!4157443076-0-cib.jpg
                      subject: RideNow超轻公路山地自行车内胎TPU耐磨轻量化便携真空胎气嘴配件
                      subjectTrans: >-
                        Сверхлегкая камера для дорожного горного велосипеда
                        RideNow из ТПУ, легкие портативные аксессуары для
                        насадок для вакуумных шин
                      offerId: 667902620673
                      isJxhy: true
                      priceInfo:
                        price: '4.00'
                        jxhyPrice: '4.00'
                        pfJxhyPrice: '4'
                        consignPrice: '10.00'
                      repurchaseRate: 26%
                      monthSold: 1388
                      traceInfo: >-
                        object_id%40667902620673%5Eobject_type%40offer%5Etrace%40212bbbe717207772685005064e1487%5Ekeyword%40%E8%BD%AE%E8%83%8E%5EoutMemberId%40null
                      isOnePsale: true
                      sellerIdentities:
                        - tp_member
                    - imageUrl: >-
                        https://cbu01.alicdn.com/img/ibank/O1CN01Efbt1i1Qqrvmo0rUR_!!2208295832028-0-cib.jpg
                      subject: 山地自行车轮胎12/14/16/20/24/26寸X1.50/1.75/1.95山地车单外胎
                      subjectTrans: >-
                        Шина для горного велосипеда 12/14/16/20/24/26 дюймов x
                        1,50/1,75/1,95 Одиночная шина для горного велосипеда
                      offerId: 656781300403
                      isJxhy: false
                      priceInfo:
                        price: '8.50'
                        jxhyPrice: null
                        pfJxhyPrice: null
                        consignPrice: '15.00'
                      repurchaseRate: 22%
                      monthSold: 790
                      traceInfo: >-
                        object_id%40656781300403%5Eobject_type%40offer%5Etrace%40212bbbe717207772685005064e1487%5Ekeyword%40%E8%BD%AE%E8%83%8E%5EoutMemberId%40null
                      isOnePsale: true
                      sellerIdentities:
                        - tp_member
                    - imageUrl: >-
                        https://cbu01.alicdn.com/img/ibank/O1CN01ctj0Ne1oIZFDlf2kg_!!4059165202-0-cib.jpg
                      subject: CYDY超轻TPU内胎公路自行车胎适合700Cx23C/25C/28C/32C仅28克
                      subjectTrans: >-
                        Сверхлегкая дорожная велосипедная шина CYDY с внутренней
                        камерой из ТПУ, подходящая для 700 Cx23C/25C/28C/32C,
                        всего 28 г
                      offerId: 757430218592
                      isJxhy: true
                      priceInfo:
                        price: '19.98'
                        jxhyPrice: '19.98'
                        pfJxhyPrice: '19.98'
                        consignPrice: '27.80'
                      repurchaseRate: 11%
                      monthSold: 1175
                      traceInfo: >-
                        object_id%40757430218592%5Eobject_type%40offer%5Etrace%40212bbbe717207772685005064e1487%5Ekeyword%40%E8%BD%AE%E8%83%8E%5EoutMemberId%40null
                      isOnePsale: true
                      sellerIdentities:
                        - powerful_merchants
                        - tp_member
                    - imageUrl: >-
                        https://cbu01.alicdn.com/img/ibank/O1CN01n87gyC235UD0lVGUl_!!2212225707204-0-cib.jpg
                      subject: 儿童自行车轮胎12/14/16/18/20寸X1.75/2.125/2.40内外胎童车配件
                      subjectTrans: >-
                        Детские велосипедные шины 12/14/16/18/20 дюймов
                        X1.75/2.125/2.40 Внутренние и внешние аксессуары для
                        колясок
                      offerId: 787619012354
                      isJxhy: true
                      priceInfo:
                        price: '12.40'
                        jxhyPrice: '12.4'
                        pfJxhyPrice: '12.4'
                        consignPrice: '12.40'
                      repurchaseRate: 13%
                      monthSold: 23
                      traceInfo: >-
                        object_id%40787619012354%5Eobject_type%40offer%5Etrace%40212bbbe717207772685005064e1487%5Ekeyword%40%E8%BD%AE%E8%83%8E%5EoutMemberId%40null
                      isOnePsale: true
                      sellerIdentities:
                        - tp_member
                    - imageUrl: >-
                        https://cbu01.alicdn.com/img/ibank/O1CN010xavBh1fGt3P7pbDp_!!2206862263980-0-cib.jpg
                      subject: 厂家直销迷你电动滑板车轮胎10寸防爆真空胎10x2.50加厚内外轮胎
                      subjectTrans: >-
                        Прямая поставка с завода Мини-электрический скутер
                        10-дюймовая Взрывозащищенная вакуумная шина Толстые
                        внутренние и внешние шины 10X2, 50
                      offerId: 608977865612
                      isJxhy: false
                      priceInfo:
                        price: '5.50'
                        jxhyPrice: null
                        pfJxhyPrice: null
                        consignPrice: '5.50'
                      repurchaseRate: 23%
                      monthSold: 3292
                      traceInfo: >-
                        object_id%40608977865612%5Eobject_type%40offer%5Etrace%40212bbbe717207772685005064e1487%5Ekeyword%40%E8%BD%AE%E8%83%8E%5EoutMemberId%40null
                      isOnePsale: true
                      sellerIdentities:
                        - tp_member
                    - imageUrl: >-
                        https://cbu01.alicdn.com/img/ibank/O1CN01U9tmEk1D8p2PhJFIu_!!1625290172-0-cib.jpg
                      subject: 自行车超轻TPU内胎700X18 25 28 32c公路死飞车tube法气嘴内胎33g
                      subjectTrans: >-
                        Велосипедная Сверхлегкая внутренняя трубка из ТПУ 700X18
                        25 28 32C дорожная мертвая Автомобильная трубка
                        воздушная насадка внутренняя трубка 33 г
                      offerId: 760888680484
                      isJxhy: true
                      priceInfo:
                        price: '16.00'
                        jxhyPrice: '16.00'
                        pfJxhyPrice: '16'
                        consignPrice: '23.00'
                      repurchaseRate: 13%
                      monthSold: 826
                      traceInfo: >-
                        object_id%40760888680484%5Eobject_type%40offer%5Etrace%40212bbbe717207772685005064e1487%5Ekeyword%40%E8%BD%AE%E8%83%8E%5EoutMemberId%40null
                      isOnePsale: true
                      sellerIdentities:
                        - powerful_merchants
                        - tp_member
                    - imageUrl: >-
                        https://cbu01.alicdn.com/img/ibank/O1CN014S2u4e2H93udRKQLD_!!2212414439107-0-cib.jpg
                      subject: MAXXIS玛吉斯自行车内胎山地公路车超轻内胎26 27.5 29寸700*23C
                      subjectTrans: >-
                        MAXXIS Magis Велосипедная внутренняя труда горная
                        дорожная машина ультра легкая внутренняя труха 26 27,5
                        29 дюймов 700 * 23C
                      offerId: 778025659594
                      isJxhy: false
                      priceInfo:
                        price: '16.50'
                        jxhyPrice: null
                        pfJxhyPrice: null
                        consignPrice: '16.50'
                      repurchaseRate: 21%
                      monthSold: 1687
                      traceInfo: >-
                        object_id%40778025659594%5Eobject_type%40offer%5Etrace%40212bbbe717207772685005064e1487%5Ekeyword%40%E8%BD%AE%E8%83%8E%5EoutMemberId%40null
                      isOnePsale: true
                      sellerIdentities:
                        - tp_member
                    - imageUrl: >-
                        https://cbu01.alicdn.com/img/ibank/10448492983_726869747.jpg
                      subject: cst/正新轮胎10寸轮胎电动滑板车10X2.25内胎平衡车10X2.50内外胎
                      subjectTrans: >-
                        CST/Positive Новая шина 10-дюймовый шинный электрический
                        скутер 10X2,25 балансировочная машина с внутренней
                        камерой 10X2, 50 внутренняя и внешняя шина
                      offerId: 587486122754
                      isJxhy: true
                      priceInfo:
                        price: '5.80'
                        jxhyPrice: '5.80'
                        pfJxhyPrice: '5.8'
                        consignPrice: '5.50'
                      repurchaseRate: 29%
                      monthSold: 3973
                      traceInfo: >-
                        object_id%40587486122754%5Eobject_type%40offer%5Etrace%40212bbbe717207772685005064e1487%5Ekeyword%40%E8%BD%AE%E8%83%8E%5EoutMemberId%40null
                      isOnePsale: true
                      sellerIdentities:
                        - tp_member
                    - imageUrl: >-
                        https://cbu01.alicdn.com/img/ibank/O1CN01vuPtAM23vhKosRDit_!!2207814237318-0-cib.jpg
                      subject: BHE 公路自行车超轻TPU内胎700X23/25/28/32/38C GRAVEL瓜车内胎
                      subjectTrans: >-
                        Сверхлегкая внутренняя трубка из ТПУ для шоссейного
                        велосипеда BHE 700X23/25/28/32/38C Внутренняя трубка
                        GRAVEL Дыня
                      offerId: 768161676471
                      isJxhy: false
                      priceInfo:
                        price: '19.80'
                        jxhyPrice: null
                        pfJxhyPrice: null
                        consignPrice: '19.80'
                      repurchaseRate: 13%
                      monthSold: 2905
                      traceInfo: >-
                        object_id%40768161676471%5Eobject_type%40offer%5Etrace%40212bbbe717207772685005064e1487%5Ekeyword%40%E8%BD%AE%E8%83%8E%5EoutMemberId%40null
                      isOnePsale: true
                      sellerIdentities:
                        - tp_member
                    - imageUrl: >-
                        https://cbu01.alicdn.com/img/ibank/O1CN01Jw7VwR1ZQbu4dV8Iw_!!1000403189-0-cib.jpg
                      subject: 自行车轮胎大全儿童自行车外胎山地车内外胎自行车胎童车外带批发
                      subjectTrans: >-
                        Велосипедная шина Daquan Детская велосипедная шина
                        Горный велосипед Внутренняя и внешняя шина Велосипедная
                        шина Детский автомобиль с оптовой продажей
                      offerId: 723708837784
                      isJxhy: true
                      priceInfo:
                        price: '5.40'
                        jxhyPrice: '5.40'
                        pfJxhyPrice: '5.4'
                        consignPrice: '10.40'
                      repurchaseRate: 11%
                      monthSold: 3081
                      traceInfo: >-
                        object_id%40723708837784%5Eobject_type%40offer%5Etrace%40212bbbe717207772685005064e1487%5Ekeyword%40%E8%BD%AE%E8%83%8E%5EoutMemberId%40null
                      isOnePsale: true
                      sellerIdentities:
                        - powerful_merchants
                        - tp_member
                    - imageUrl: >-
                        https://cbu01.alicdn.com/img/ibank/O1CN018tjHfc1f96VChtcX8_!!2211211103963-0-cib.jpg
                      subject: GUSTAVO TPU 内胎 砾石公路车700CX 23-32C/35-50C 法嘴 45/65MM
                      subjectTrans: >-
                        GUSTAVO TPU внутренняя труба гравийный дорожный
                        автомобиль 700CX 23-32C/35-50C французский рот 45/65 мм
                      offerId: 746535432296
                      isJxhy: true
                      priceInfo:
                        price: '18.00'
                        jxhyPrice: '16'
                        pfJxhyPrice: '19.99'
                        consignPrice: '18.00'
                      repurchaseRate: 21%
                      monthSold: 5346
                      traceInfo: >-
                        object_id%40746535432296%5Eobject_type%40offer%5Etrace%40212bbbe717207772685005064e1487%5Ekeyword%40%E8%BD%AE%E8%83%8E%5EoutMemberId%40null
                      isOnePsale: true
                      sellerIdentities:
                        - tp_member
                    - imageUrl: >-
                        https://cbu01.alicdn.com/img/ibank/2019/642/012/12267210246_958731809.jpg
                      subject: 自行车轮胎12/14/16/20/24/26寸X1.75/1.95/2.4 山地车内外胎配件
                      subjectTrans: >-
                        Велосипедная шина 12/14/16/20/24/26 дюймов
                        X1.75/1,95/2,4 горный велосипед аксессуары для
                        внутренних и внешних шин
                      offerId: 605190201600
                      isJxhy: true
                      priceInfo:
                        price: '6.25'
                        jxhyPrice: '6.25'
                        pfJxhyPrice: '6.25'
                        consignPrice: '6.35'
                      repurchaseRate: 11%
                      monthSold: 9006
                      traceInfo: >-
                        object_id%40605190201600%5Eobject_type%40offer%5Etrace%40212bbbe717207772685005064e1487%5Ekeyword%40%E8%BD%AE%E8%83%8E%5EoutMemberId%40null
                      isOnePsale: true
                      sellerIdentities:
                        - powerful_merchants
                        - tp_member
                    - imageUrl: >-
                        https://cbu01.alicdn.com/img/ibank/O1CN01CmVcH11YxkkxyQ9lu_!!2191823126-0-cib.jpg
                      subject: 丁基胶内胎自行车美嘴法嘴弯嘴内胎小轮折叠自行车轮内胎单车内带
                      subjectTrans: >-
                        Бутилкаучук внутренняя трубка велосипед Красивый рот
                        французский рот изогнутый рот внутренняя трубка
                        маленькое колесо складной велосипед колесо внутренняя
                        трубка велосипед Внутренний ремень
                      offerId: 631905267359
                      isJxhy: true
                      priceInfo:
                        price: '6.00'
                        jxhyPrice: '6.00'
                        pfJxhyPrice: '6'
                        consignPrice: '10.00'
                      repurchaseRate: 38%
                      monthSold: 3731
                      traceInfo: >-
                        object_id%40631905267359%5Eobject_type%40offer%5Etrace%40212bbbe717207772685005064e1487%5Ekeyword%40%E8%BD%AE%E8%83%8E%5EoutMemberId%40null
                      isOnePsale: true
                      sellerIdentities:
                        - tp_member
                    - imageUrl: >-
                        https://cbu01.alicdn.com/img/ibank/O1CN01F5iP4R2KNfADhIn8o_!!2808339545-0-cib.jpg
                      subject: 3.00-10 3.50-10 300-10 350-10摩托车电动车 真空轮胎 外胎 配件
                      subjectTrans: >-
                        3,00-10 3,50-10 300-10 350-10 Мотоцикл Электромобиль
                        Вакуумные шины Аксессуары для шин
                      offerId: 659572201005
                      isJxhy: true
                      priceInfo:
                        price: '27.00'
                        jxhyPrice: '27.00'
                        pfJxhyPrice: '24.3'
                        consignPrice: '31.00'
                      repurchaseRate: 13%
                      monthSold: 787
                      traceInfo: >-
                        object_id%40659572201005%5Eobject_type%40offer%5Etrace%40212bbbe717207772685005064e1487%5Ekeyword%40%E8%BD%AE%E8%83%8E%5EoutMemberId%40null
                      isOnePsale: true
                      sellerIdentities:
                        - powerful_merchants
                        - tp_member
                    - imageUrl: >-
                        https://cbu01.alicdn.com/img/ibank/O1CN01DNYty62Dzx6cFD2Xs_!!934978681-0-cib.jpg
                      subject: 10寸10X2.125滑板车轮胎微型电动车轮胎漂移车加厚环保丁基内外胎
                      subjectTrans: >-
                        10x2.125 10X2, 50 шина для скутера мини-электромобиль
                        шина Дрифт автомобиля внутренняя и внешняя шина
                      offerId: 520078793663
                      isJxhy: false
                      priceInfo:
                        price: '5.00'
                        jxhyPrice: null
                        pfJxhyPrice: null
                        consignPrice: '5.00'
                      repurchaseRate: 7%
                      monthSold: 560
                      traceInfo: >-
                        object_id%40520078793663%5Eobject_type%40offer%5Etrace%40212bbbe717207772685005064e1487%5Ekeyword%40%E8%BD%AE%E8%83%8E%5EoutMemberId%40null
                      isOnePsale: true
                      sellerIdentities:
                        - powerful_merchants
                        - tp_member
                    - imageUrl: >-
                        https://cbu01.alicdn.com/img/ibank/O1CN01YGvgbP246gnCuq3kb_!!2213187717342-0-cib.jpg
                      subject: 175x50充气轮胎电动滑板车轮椅车内外胎加厚高含胶7寸轮胎充气胎
                      subjectTrans: >-
                        Пневматическая шина 175x50, Электрический скутер,
                        внутренние и внешние шины для инвалидной коляски,
                        утолщенная резина, 7-дюймовая надувная шина
                      offerId: 738817186117
                      isJxhy: true
                      priceInfo:
                        price: '8.00'
                        jxhyPrice: '8.00'
                        pfJxhyPrice: '8'
                        consignPrice: '8.00'
                      repurchaseRate: 28%
                      monthSold: 155
                      traceInfo: >-
                        object_id%40738817186117%5Eobject_type%40offer%5Etrace%40212bbbe717207772685005064e1487%5Ekeyword%40%E8%BD%AE%E8%83%8E%5EoutMemberId%40null
                      isOnePsale: true
                      sellerIdentities:
                        - tp_member
                timestamp: 1720777269596
                traceId: 94a32c3df91b
          headers: {}
          x-apifox-name: 成功
      security: []
      x-apifox-folder: 接口说明/1688 API/1688 商品搜索
      x-apifox-status: released
      x-run-in-apifox: https://app.apifox.com/web/project/4330288/apis/api-182690989-run
components:
  schemas: {}
  securitySchemes: {}
servers:
  - url: https://openapi.dajisaas.com
    description: 正式环境
security: []

```