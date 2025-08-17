# 上传图片获取imageId

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /alibaba/upload/image:
    post:
      summary: 上传图片获取imageId
      deprecated: false
      description: 请通过POST方式，提交image_base64，获取imageId用于后续的图搜接口。
      tags:
        - 接口说明/1688 API/1688 商品搜索
      parameters: []
      requestBody:
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                appKey:
                  description: 大吉平台appKey
                  example: ''
                  type: string
                appSecret:
                  description: 秘钥，仅调试使用，正式用sign签名
                  example: ''
                  type: string
                sign:
                  description: sign签名，请求的参数字典排序+秘钥appSecret，调试时可忽略改字段
                  example: ''
                  type: string
                image_base64:
                  description: >-
                    POST方式，Base64编码必须是JPG(.jpg/.jpeg)、PNG(.png)或WEBP(.webp)格式的图像文件编码，大小上限为3MB
                  example: >-
                    iVBORw0KGgoAAAANSUhEUgAAALAAAABECAMAAAAWak9jAAAAM1BMVEVHcEz/QAD/QAD/QAD/QAD/QAD/QAD/QAD/QAD/QAD/QAD/QAD/QAD/QAD/QAD/QAD/QADMFfevAAAAEHRSTlMAv98g759AEGCAz3Awj1CvbIbrXAAABJFJREFUaN61mlmi4ygMRcM8GZv9r7aTflX9Amh00vyaY1+DEJLg8diby1d8MC2drZtq/Xg2Wy+H94zNmGc/a83Vjoek/RJBQLhWnxoM2ecMrz7vrWHfvuZ+PnBDoSOObn+6EYKPYMfWMtg1Az2HoQSoiPimBBUczYAaZBIO7jpGT9jsKog4jxsi2AXkjUDf5gfWLGyZcuIMa1dYcEPfp+j7r2Eej/tEviCzgRxDQF8XdmMcQ6lYSlTwMSDYWfxtZbOwwTTr7hJSwZTesS1jw31+m5QqJbJMMKnXJ405gp5QTjiR4ETp3RZ9WtZwiOnh4rIEKkF4kPgjKkgEQwtzVBPKs52OtuD/9m1XUd+tIaJA8D5hNpx4/DD9Xn8bx4pt50ZDVFawW920zWRg5LGZn1ZCRQjDEZkVbDRyl2URcWd7mzA/c1wxwYtBVMcFXMQe+P6iBBJ1mS6IaP0VdxpE8LKCAxuhZtget8k6PiDWJ++Ci1Lv9Pk1UA7g3OsJQvA8wDZ9T/DxAUEILmzgS9kwNcG/7zrVBCHYk1EOJ7gSHi99QOCCIxk0wG2gs9gQZXoCFWzUAzwzFh2u/hGBCZ6X3B8bSi7GeCTRqps2WoNtEHoCExy3/e83x/emRH6rG1cCQ1T/GYEJ7vOvuzX7qwUa6DkC9P0ZLKY1WCwfEojgKTIyUCjqT106BS8gPQELToJEYJikzSiBrIonDongQyJ4zyjX7WZv7QsEJDiPu4o7CUD+UU1AgssY/8cYw/5cS0CCg1AwEMQlPHFHCmFaAhJspIK3+iW57A1YPNQSkOAqFrwYxem1pSo9AQm2YsGzlbGLdfu+npAKNi265M7uiQqmwLks39cTQsE2ouXcjJcFWBvSE4hgct6XusyFFfb81WI8m/G4Y0EI2hUJBBfSD8H+1Je/A5M6NiV6Qia4054oglnrVELzoNXrCZkNeybIacBwLXY3/2F+3CVkgqHtse4m9j4mniy0m8ddQrZxJCYbMvsHCh3bp5uEbGuuXDZkt/kFjGhKhs6bhCz4CVxKb7fXBJER6QlZeNlBwXYVbJkT3bJ9Rk/ggk+9YPJ0CayM6AlccAR3MsokHJmGLcvUqwnLZc30+SxQFXPceG0ldacZ4cEJNszfl3VBOO5WQicFnxJCWkgJzPlL2woDQVJ4c0PhJViTiHRxuOzTOahtaykc1JsEVb20VPn98LvPr/S+Zfbx1BOU4GljDIkITAx0aOrITKjdJCjBDj/yOi1UfMpUlnB4ANET5JGBWYLrhFynseAfzifnS2bs7xKk4O0s2pScW7doYSJgN4y2G0MFIQpLkOd0supPRYzoJ9HOMZeKXrPQE6RgJypOHNo/fB8uPUEJniIgSTFU9ofvLlVPkIIFNcyuu3C0bRF6ghTMKg7K4vRex9ETpGDmDlHXXZrbfNc9ghS81Ae4Yv6zv9UWwPUEKfiRLuRNyN3hVIiblPkrhGEq3uDFVuI6zXam9xfp7jsEJ/h1GXl+oWWuL6e8/aMP59eIFn4bNm4plvC6SO6ruRp77/wFHC0Y+yJsNf0U3ClPkST+AWWTi8bFosw5AAAAAElFTkSuQmCC
                  type: string
              required:
                - image_base64
            example: ''
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
                      imageId:
                        type: string
                        description: 图片ID，用于图片搜索使用
                    required:
                      - imageId
                    x-apifox-orders:
                      - imageId
                    description: 业务信息
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
                  imageId: '1164408192156408878'
                timestamp: 1724224057972
                traceId: 6b9849c1a5b0
          headers: {}
          x-apifox-name: 成功
      security: []
      x-apifox-folder: 接口说明/1688 API/1688 商品搜索
      x-apifox-status: released
      x-run-in-apifox: https://app.apifox.com/web/project/4330288/apis/api-207062632-run
components:
  schemas: {}
  securitySchemes: {}
servers:
  - url: https://openapi.dajisaas.com
    description: 正式环境
security: []

```