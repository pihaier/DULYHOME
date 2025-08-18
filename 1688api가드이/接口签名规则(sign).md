# 接口签名规则(sign)

成为开发者后，您就可以使用 Access Key 和 Access 密钥开始您的应用开发了。

**接口签名规则(sign)**：

```java
/**
 * sign签名字符串生成规则
 */
public static String getSignString(Map<String, Object> params, String secret) {
    // 删除sign签名字段
    params.remove("sign");

    // 由于map是无序的，这里主要是对key进行排序（字典序）
    Set<String> keySet = params.keySet();
    String[] keyArr = keySet.toArray(new String[keySet.size()]);

    // 字典排序
    Arrays.sort(keyArr);

    StringBuilder sbd = new StringBuilder();
    for (String k : keyArr) {
        if (Optional.ofNullable(params.get(k)).isPresent()) {
            sbd.append(k).append("=").append(params.get(k)).append("&");
        }
    }

    // secret最后拼接
    sbd.append("secret=").append(secret);
    return sbd.toString();
}
```


```java
/**
 * 对生成的sign字符串做MD5加密
 * 字符串转大写
 */
public static String getMD5String(String str) {
    try {
        MessageDigest md = MessageDigest.getInstance("MD5");
        byte[] digest = md.digest(str.getBytes());
        StringBuilder sb = new StringBuilder();
        for (byte b : digest) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString().toUpperCase();
    } catch (Exception e) {
        return null;
    }
}
```