import java.io.FileOutputStream;

public class Main {

    public static void main(String[] args) throws Exception {
        FileOutputStream fos = new FileOutputStream("binaryFile.bin");
        byte[] bytes = {
            (byte) 0x00,
            (byte) 0xFF,
            (byte) 0x10,
            (byte) 0xA7
        };
        fos.write(bytes);
        fos.close();
    }
}