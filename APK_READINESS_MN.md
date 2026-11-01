# Нахиа Android APK бэлэн байдлын шалгалт

2026-11-01. Одоогийн бүтээгдэхүүн нь ажилладаг веб/PWA апп; Android APK одоогоор үүсгээгүй.

## Бэлэн байгаа

- Утасны хэмжээний зохицол, бичих дөрвөн горим, локал өгөгдөл, 11,000 үг, нөөцлөх/сэргээх.
- Нахиа нэр, 192/512px дүрс, өдөр/шөнийн горим, үндсэн оффлайн cache.
- Энэ компьютерт Node/npm, Android Studio-ийн Java 21.0.10, Android SDK platform 34 ба 36.1, build-tools 34.0.0/36.1.0/37.0.0, adb байна. JAVA_HOME/SDK замыг build орчинд тохируулах шаардлагатай.

## APK гаргахад үлдсэн ажил

1. Capacitor Android төсөл үүсгэж, package.json/lockfile, capacitor config, android/ ба Gradle wrapper нэмэх. Одоогийн JS аппыг дахин бичих шаардлагагүй. App ID, versionCode/versionName, minimum/target SDK-г тогтооно.
2. Runtime веб файлуудыг тусдаа webDir рүү багцалж, бүх өгөгдөл, фонт, зураг, ханзны замыг Android дотор ачаалдаг болгох. Эх код, тест, тайланг APK runtime багцад хийхгүй.
3. Android-ийн Back үйлдэл, safe-area/keyboard, Хятад TTS хоолой, нөөц JSON татах/сонгох, worksheet хэвлэх үйлдлийг WebView дээр туршиж шаардлагатай native холбоосыг хийх. Шинэ app origin-д хуучин браузерын ахиц автоматаар шилжихгүй; export/import ашиглана.
4. Emulator болон бодит утсанд бичих мэдрэмж, scroll, эргэлт, бага санах ой, хааж нээх, оффлайн эхлүүлэх, ахиц хадгалахыг шалгах. Эхлээд debug APK-гаар суулгаж туршина.
5. Түгээх release APK-д эзэмшигчийн signing keystore үүсгэж найдвартай хадгалах. Нууц түлхүүр, нууц үгийг GitHub-д оруулахгүй. Дараагийн шинэчлэлт ижил гарын үсэгтэй байна. Google Play-д гаргавал AAB, дэлгүүрийн тайлбар/зураг, privacy/data safety мэдээллийг тусад нь бэлдэнэ.

GitHub-д код байрлуулах нь APK автоматаар үүсгэхгүй. HTTPS орчинд PWA суулгах нь Android native багц бэлтгэхээс тусдаа.

## Албан эх

- [Capacitor Android](https://capacitorjs.com/docs/android): Android Studio, native Android runtime, төхөөрөмж/emulator; одоогийн v8 нь API24+ дэмжинэ.
- [Android app signing](https://developer.android.com/studio/publish/app-signing): суулгах APK бүр гарын үсэгтэй байх ёстой; debug ба release түлхүүрийн ялгаа.
