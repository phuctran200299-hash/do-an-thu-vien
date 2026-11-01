<?php

namespace Database\Seeders;

use App\Models\AiRecommendationLog;
use App\Models\Author;
use App\Models\Book;
use App\Models\BorrowRecord;
use App\Models\Category;
use App\Models\Fine;
use App\Models\Payment;
use App\Models\Reservation;
use App\Models\Role;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * Bộ dữ liệu mẫu phong phú phục vụ demo: nhiều đầu sách, độc giả và lịch sử mượn - trả trải dài ~4 tháng,
 * để các màn hình thống kê, gợi ý AI, đánh giá, đặt trước... đều có dữ liệu thực tế để hiển thị.
 * Chạy lại nhiều lần không bị nhân đôi dữ liệu giao dịch.
 */
class RichDemoSeeder extends Seeder
{
    private const MARKER_EMAIL = 'docgia01@demo.thuvien.vn';

    private array $categories = [
        'Văn học' => 'Tiểu thuyết, truyện ngắn, thơ ca trong và ngoài nước',
        'Kỹ năng sống' => 'Sách phát triển bản thân, kỹ năng mềm',
        'Kinh tế' => 'Sách về kinh doanh, quản trị, tài chính',
        'Công nghệ thông tin' => 'Lập trình, khoa học máy tính, công nghệ',
        'Khoa học' => 'Sách phổ biến khoa học tự nhiên, xã hội',
        'Thiếu nhi' => 'Truyện tranh, sách giáo dục cho trẻ em',
        'Lịch sử' => 'Sách về lịch sử Việt Nam và thế giới',
        'Ngoại ngữ' => 'Sách học tiếng Anh và các ngoại ngữ khác',
        'Tâm lý học' => 'Khám phá tâm trí, hành vi và cảm xúc con người',
        'Trinh thám' => 'Truyện trinh thám, phá án, ly kỳ hồi hộp',
        'Khoa học viễn tưởng' => 'Thế giới tương lai, vũ trụ và công nghệ giả tưởng',
        'Triết học' => 'Tư tưởng triết học phương Đông và phương Tây',
    ];

    private array $authors = [
        'Nguyễn Nhật Ánh' => 'Nhà văn Việt Nam nổi tiếng với nhiều tác phẩm văn học thiếu nhi và tuổi mới lớn.',
        'Tô Hoài' => 'Nhà văn Việt Nam, tác giả của nhiều tác phẩm văn học kinh điển.',
        'Nam Cao' => 'Nhà văn hiện thực xuất sắc của văn học Việt Nam giai đoạn 1930–1945.',
        'Vũ Trọng Phụng' => 'Nhà văn, nhà báo, được mệnh danh "ông vua phóng sự đất Bắc".',
        'Nguyễn Du' => 'Đại thi hào dân tộc, tác giả Truyện Kiều.',
        'Bảo Ninh' => 'Nhà văn Việt Nam, tác giả tiểu thuyết Nỗi buồn chiến tranh.',
        'Paulo Coelho' => 'Nhà văn người Brazil, tác giả của nhiều tiểu thuyết nổi tiếng thế giới.',
        'Haruki Murakami' => 'Tiểu thuyết gia Nhật Bản với lối viết siêu thực, cô đơn và đầy chất thơ.',
        'George Orwell' => 'Nhà văn Anh, tác giả hai kiệt tác phản địa đàng 1984 và Trại súc vật.',
        'Antoine de Saint-Exupéry' => 'Phi công, nhà văn Pháp, tác giả Hoàng tử bé.',
        'Arthur Conan Doyle' => 'Nhà văn Scotland, cha đẻ của thám tử Sherlock Holmes.',
        'Agatha Christie' => 'Nữ hoàng truyện trinh thám người Anh.',
        'Dan Brown' => 'Tác giả người Mỹ của loạt tiểu thuyết ly kỳ về giáo sư Robert Langdon.',
        'Isaac Asimov' => 'Nhà văn khoa học viễn tưởng, tác giả loạt truyện Nền tảng và Robot.',
        'Frank Herbert' => 'Tác giả tiểu thuyết khoa học viễn tưởng kinh điển Xứ cát (Dune).',
        'Lưu Từ Hân' => 'Nhà văn khoa học viễn tưởng Trung Quốc, tác giả bộ Tam thể.',
        'Dale Carnegie' => 'Tác giả người Mỹ, nổi tiếng với các sách về kỹ năng sống và phát triển bản thân.',
        'James Clear' => 'Tác giả Atomic Habits, chuyên nghiên cứu về thói quen và hiệu suất.',
        'Stephen R. Covey' => 'Tác giả 7 thói quen của người thành đạt.',
        'Robert T. Kiyosaki' => 'Tác giả người Mỹ, chuyên viết về tài chính cá nhân và đầu tư.',
        'Morgan Housel' => 'Nhà báo tài chính, tác giả Tâm lý học về tiền.',
        'Simon Sinek' => 'Diễn giả, tác giả Bắt đầu với câu hỏi Tại sao.',
        'Robert C. Martin' => 'Kỹ sư phần mềm, tác giả nhiều sách kinh điển về lập trình.',
        'Eric Matthes' => 'Tác giả sách hướng dẫn lập trình Python cho người mới bắt đầu.',
        'Andrew Hunt' => 'Đồng tác giả The Pragmatic Programmer.',
        'Martin Kleppmann' => 'Nhà nghiên cứu hệ thống phân tán, tác giả Designing Data-Intensive Applications.',
        'Yuval Noah Harari' => 'Sử gia, tác giả người Israel, nổi tiếng với các sách về lịch sử loài người.',
        'Stephen Hawking' => 'Nhà vật lý lý thuyết người Anh, tác giả Lược sử thời gian.',
        'Daniel Kahneman' => 'Nhà tâm lý học đoạt giải Nobel Kinh tế, tác giả Tư duy nhanh và chậm.',
        'Jared Diamond' => 'Nhà địa lý học, tác giả Súng, vi trùng và thép.',
        'Trần Trọng Kim' => 'Nhà giáo dục, sử gia, tác giả Việt Nam sử lược.',
        'Jostein Gaarder' => 'Nhà văn Na Uy, tác giả Thế giới của Sophie.',
        'Fujiko F. Fujio' => 'Họa sĩ truyện tranh Nhật Bản, cha đẻ của Doraemon.',
        'Raymond Murphy' => 'Tác giả bộ giáo trình English Grammar in Use.',
    ];

    /** [tên sách, thể loại, [tác giả], số lượng, phí mượn, mô tả] */
    private array $books = [
        ['Cho tôi xin một vé đi tuổi thơ', 'Văn học', ['Nguyễn Nhật Ánh'], 5, 0, 'Tác phẩm viết về những kỷ niệm tuổi thơ trong trẻo, hồn nhiên.'],
        ['Mắt biếc', 'Văn học', ['Nguyễn Nhật Ánh'], 4, 0, 'Câu chuyện tình yêu nhẹ nhàng nhưng day dứt của tuổi trẻ.'],
        ['Tôi thấy hoa vàng trên cỏ xanh', 'Văn học', ['Nguyễn Nhật Ánh'], 6, 0, 'Những rung động đầu đời và tình anh em nơi làng quê nghèo miền Trung.'],
        ['Cô gái đến từ hôm qua', 'Văn học', ['Nguyễn Nhật Ánh'], 3, 0, 'Chuyện tình học trò dí dỏm với những hiểu lầm đáng yêu.'],
        ['Có hai con mèo ngồi bên cửa sổ', 'Văn học', ['Nguyễn Nhật Ánh'], 5, 0, 'Câu chuyện cảm động về tình bạn khác thường giữa mèo Gấu và chuột Tí Hon.'],
        ['Chí Phèo', 'Văn học', ['Nam Cao'], 4, 0, 'Bi kịch người nông dân bị tha hoá trong xã hội cũ.'],
        ['Lão Hạc', 'Văn học', ['Nam Cao'], 3, 0, 'Truyện ngắn cảm động về phẩm giá người nông dân nghèo.'],
        ['Số đỏ', 'Văn học', ['Vũ Trọng Phụng'], 4, 0, 'Tiểu thuyết trào phúng sắc sảo về xã hội thành thị thời Pháp thuộc.'],
        ['Truyện Kiều', 'Văn học', ['Nguyễn Du'], 5, 0, 'Kiệt tác thơ lục bát kể về cuộc đời truân chuyên của Thuý Kiều.'],
        ['Nỗi buồn chiến tranh', 'Văn học', ['Bảo Ninh'], 3, 5000, 'Tiểu thuyết về ký ức, tình yêu và nỗi đau hậu chiến.'],
        ['Nhà Giả Kim', 'Văn học', ['Paulo Coelho'], 6, 0, 'Hành trình theo đuổi giấc mơ và lắng nghe trái tim của chàng chăn cừu Santiago.'],
        ['Rừng Na Uy', 'Văn học', ['Haruki Murakami'], 4, 5000, 'Câu chuyện về tình yêu, mất mát và tuổi trẻ ở Tokyo thập niên 60.'],
        ['Kafka bên bờ biển', 'Văn học', ['Haruki Murakami'], 2, 8000, 'Tiểu thuyết siêu thực đan xen hai hành trình kỳ lạ.'],
        ['Hoàng tử bé', 'Thiếu nhi', ['Antoine de Saint-Exupéry'], 7, 0, 'Câu chuyện triết lý nhẹ nhàng về tình bạn, tình yêu và cách nhìn thế giới.'],
        ['Dế Mèn phiêu lưu ký', 'Thiếu nhi', ['Tô Hoài'], 6, 0, 'Tác phẩm kinh điển của văn học thiếu nhi Việt Nam.'],
        ['Doraemon - Tập 1', 'Thiếu nhi', ['Fujiko F. Fujio'], 8, 0, 'Chú mèo máy đến từ tương lai cùng những bảo bối thần kỳ.'],
        ['Doraemon - Nobita và cuộc chiến vũ trụ', 'Thiếu nhi', ['Fujiko F. Fujio'], 5, 0, 'Cuộc phiêu lưu ngoài không gian của nhóm bạn Nobita.'],
        ['1984', 'Khoa học viễn tưởng', ['George Orwell'], 4, 0, 'Tiểu thuyết phản địa đàng về một xã hội bị giám sát toàn diện.'],
        ['Trại súc vật', 'Văn học', ['George Orwell'], 3, 0, 'Ngụ ngôn chính trị châm biếm qua câu chuyện các con vật nổi dậy.'],
        ['Nền tảng (Foundation)', 'Khoa học viễn tưởng', ['Isaac Asimov'], 3, 8000, 'Sử thi về sự sụp đổ và tái thiết của một đế chế thiên hà.'],
        ['Tôi là Robot', 'Khoa học viễn tưởng', ['Isaac Asimov'], 3, 5000, 'Tuyển tập truyện ngắn về ba định luật robot nổi tiếng.'],
        ['Xứ cát (Dune)', 'Khoa học viễn tưởng', ['Frank Herbert'], 3, 10000, 'Cuộc chiến giành quyền kiểm soát hành tinh sa mạc Arrakis.'],
        ['Tam thể', 'Khoa học viễn tưởng', ['Lưu Từ Hân'], 4, 10000, 'Cuộc tiếp xúc đầu tiên của nhân loại với nền văn minh ngoài Trái Đất.'],
        ['Những cuộc phiêu lưu của Sherlock Holmes', 'Trinh thám', ['Arthur Conan Doyle'], 5, 0, 'Tuyển tập các vụ án kinh điển của thám tử lừng danh phố Baker.'],
        ['Con chó của dòng họ Baskerville', 'Trinh thám', ['Arthur Conan Doyle'], 3, 0, 'Bí ẩn về con chó ma ám ảnh một dòng họ quý tộc.'],
        ['Án mạng trên chuyến tàu tốc hành phương Đông', 'Trinh thám', ['Agatha Christie'], 4, 5000, 'Hercule Poirot phá vụ án mạng trên chuyến tàu bị kẹt trong tuyết.'],
        ['Mười người da đen nhỏ', 'Trinh thám', ['Agatha Christie'], 3, 5000, 'Mười người lạ bị mời đến hòn đảo hoang và lần lượt bị sát hại.'],
        ['Mật mã Da Vinci', 'Trinh thám', ['Dan Brown'], 4, 8000, 'Giáo sư Langdon giải mã bí ẩn ẩn giấu trong các tác phẩm của Leonardo.'],
        ['Thiên thần và ác quỷ', 'Trinh thám', ['Dan Brown'], 3, 8000, 'Cuộc truy đuổi nghẹt thở giữa lòng Vatican.'],
        ['Đắc Nhân Tâm', 'Kỹ năng sống', ['Dale Carnegie'], 8, 0, 'Cuốn sách kinh điển về nghệ thuật đối nhân xử thế.'],
        ['Đắc Nhân Tâm Trong Kinh Doanh', 'Kỹ năng sống', ['Dale Carnegie'], 3, 5000, 'Ứng dụng nghệ thuật giao tiếp vào môi trường kinh doanh.'],
        ['Quẳng gánh lo đi và vui sống', 'Kỹ năng sống', ['Dale Carnegie'], 4, 0, 'Phương pháp thực tế để vượt qua lo âu và sống tích cực.'],
        ['Atomic Habits - Thay đổi tí hon, hiệu quả bất ngờ', 'Kỹ năng sống', ['James Clear'], 6, 5000, 'Cách xây dựng thói quen tốt và loại bỏ thói quen xấu bằng những thay đổi nhỏ.'],
        ['7 thói quen của người thành đạt', 'Kỹ năng sống', ['Stephen R. Covey'], 4, 0, 'Bảy nguyên tắc nền tảng giúp phát triển hiệu quả cá nhân và tập thể.'],
        ['Cha Giàu Cha Nghèo', 'Kinh tế', ['Robert T. Kiyosaki'], 5, 0, 'Cuốn sách nổi tiếng về tư duy tài chính cá nhân.'],
        ['Tâm lý học về tiền', 'Kinh tế', ['Morgan Housel'], 4, 5000, '19 câu chuyện về cách con người suy nghĩ và hành xử với tiền bạc.'],
        ['Bắt đầu với câu hỏi Tại sao', 'Kinh tế', ['Simon Sinek'], 3, 5000, 'Vì sao những nhà lãnh đạo vĩ đại truyền cảm hứng cho người khác hành động.'],
        ['Clean Code', 'Công nghệ thông tin', ['Robert C. Martin'], 4, 10000, 'Sách kinh điển về viết mã nguồn sạch, dễ bảo trì.'],
        ['Clean Architecture', 'Công nghệ thông tin', ['Robert C. Martin'], 3, 10000, 'Nguyên lý thiết kế kiến trúc phần mềm bền vững.'],
        ['Python Crash Course', 'Công nghệ thông tin', ['Eric Matthes'], 6, 0, 'Giáo trình nhập môn lập trình Python cho người mới bắt đầu.'],
        ['The Pragmatic Programmer', 'Công nghệ thông tin', ['Andrew Hunt'], 3, 10000, 'Những lời khuyên thực tiễn để trở thành lập trình viên chuyên nghiệp.'],
        ['Designing Data-Intensive Applications', 'Công nghệ thông tin', ['Martin Kleppmann'], 2, 15000, 'Thiết kế hệ thống dữ liệu lớn: lưu trữ, nhân bản, phân vùng và nhất quán.'],
        ['Sapiens: Lược Sử Loài Người', 'Lịch sử', ['Yuval Noah Harari'], 4, 0, 'Hành trình khám phá lịch sử tiến hoá của loài người.'],
        ['Homo Deus: Lược Sử Tương Lai', 'Khoa học', ['Yuval Noah Harari'], 3, 0, 'Những dự đoán về tương lai của loài người và công nghệ.'],
        ['21 bài học cho thế kỷ 21', 'Triết học', ['Yuval Noah Harari'], 3, 5000, 'Những vấn đề cấp bách nhất của nhân loại trong thời đại hiện nay.'],
        ['Việt Nam sử lược', 'Lịch sử', ['Trần Trọng Kim'], 4, 0, 'Bộ thông sử Việt Nam viết bằng chữ quốc ngữ đầu tiên.'],
        ['Súng, vi trùng và thép', 'Lịch sử', ['Jared Diamond'], 3, 5000, 'Lý giải vì sao các nền văn minh phát triển không đồng đều.'],
        ['Lược sử thời gian', 'Khoa học', ['Stephen Hawking'], 4, 0, 'Giải thích dễ hiểu về vũ trụ, lỗ đen và bản chất của thời gian.'],
        ['Vũ trụ trong vỏ hạt dẻ', 'Khoa học', ['Stephen Hawking'], 2, 5000, 'Hành trình khám phá vật lý hiện đại qua hình ảnh minh hoạ sinh động.'],
        ['Tư duy nhanh và chậm', 'Tâm lý học', ['Daniel Kahneman'], 4, 5000, 'Hai hệ thống tư duy chi phối mọi quyết định của con người.'],
        ['Thế giới của Sophie', 'Triết học', ['Jostein Gaarder'], 3, 0, 'Tiểu thuyết dẫn dắt người đọc qua lịch sử triết học phương Tây.'],
        ['English Grammar in Use', 'Ngoại ngữ', ['Raymond Murphy'], 6, 0, 'Giáo trình ngữ pháp tiếng Anh tự học phổ biến nhất thế giới.'],
        ['Essential Grammar in Use', 'Ngoại ngữ', ['Raymond Murphy'], 4, 0, 'Ngữ pháp tiếng Anh cơ bản dành cho người mới bắt đầu.'],
    ];

    private array $readerNames = [
        'Nguyễn Văn An', 'Trần Thị Bình', 'Lê Hoàng Cường', 'Phạm Thu Dung', 'Hoàng Minh Đức', 'Vũ Thị Hà',
        'Đặng Quốc Hùng', 'Bùi Ngọc Lan', 'Đỗ Thanh Long', 'Hồ Thị Mai', 'Ngô Văn Nam', 'Dương Thị Oanh',
        'Lý Hoàng Phúc', 'Trịnh Minh Quân', 'Mai Thị Quỳnh', 'Phan Văn Sơn', 'Tạ Thu Trang', 'Lương Đức Tuấn',
        'Chu Thị Uyên', 'Đinh Quang Vinh', 'Cao Thị Xuân', 'Võ Minh Yến', 'Nguyễn Hải Đăng', 'Trần Bảo Ngọc',
        'Lê Thị Kim Anh', 'Phạm Gia Huy', 'Hoàng Thảo Vy', 'Vũ Đình Khoa', 'Đặng Thị Hồng', 'Bùi Tiến Dũng',
        'Đỗ Minh Châu', 'Hồ Quang Hiếu', 'Ngô Thị Thanh', 'Dương Khánh Linh', 'Lý Thành Công', 'Trịnh Thị Hoa',
        'Mai Anh Tú', 'Phan Thị Ngân', 'Tạ Quang Minh', 'Lương Thị Hạnh',
    ];

    private array $reviewComments = [
        5 => ['Tuyệt vời, đọc một mạch không dứt ra được!', 'Một trong những cuốn hay nhất mình từng đọc.', 'Rất đáng đọc, mình sẽ giới thiệu cho bạn bè.', 'Nội dung sâu sắc, đọc xong thấm rất lâu.'],
        4 => ['Sách hay, nội dung bổ ích.', 'Khá cuốn, chỉ có vài đoạn hơi dài.', 'Đáng thời gian bỏ ra, bản sách của thư viện còn rất mới.', 'Hay, phù hợp đọc cuối tuần.'],
        3 => ['Ổn, nhưng không quá ấn tượng.', 'Nội dung được, cách viết hơi khô.', 'Đọc tạm được, kỳ vọng nhiều hơn.'],
        2 => ['Hơi khó đọc với mình.', 'Không hợp gu lắm.'],
    ];

    private array $aiQueries = [
        'sách về lập trình cho người mới', 'tiểu thuyết trinh thám hay', 'sách giúp quản lý tài chính cá nhân',
        'truyện thiếu nhi cho bé 8 tuổi', 'sách lịch sử việt nam', 'sách khoa học vũ trụ', 'tôi muốn tìm sách về thói quen',
        'tiểu thuyết khoa học viễn tưởng', 'sách tâm lý học dễ đọc', 'sách học tiếng anh ngữ pháp', 'nguyễn nhật ánh',
        'sách về kỹ năng giao tiếp', 'sách triết học nhập môn', 'truyện ngắn văn học việt nam',
    ];

    /** Ảnh bìa thật và các đầu sách bổ sung, xem database/seeders/data/real_catalog.php */
    private array $realCatalog = [];

    /** Tiểu sử các tác giả của nhóm sách bổ sung */
    private array $extraAuthors = [
        'Đặng Thùy Trâm' => 'Bác sĩ, liệt sĩ, tác giả cuốn nhật ký thời chiến nổi tiếng được xuất bản năm 2005.',
        'Gabriel García Márquez' => 'Nhà văn Colombia, giải Nobel Văn học 1982, bậc thầy của chủ nghĩa hiện thực huyền ảo.',
        'Ernest Hemingway' => 'Nhà văn Mỹ, giải Nobel Văn học 1954, nổi tiếng với lối viết kiệm lời.',
        'F. Scott Fitzgerald' => 'Nhà văn Mỹ tiêu biểu cho "Thời đại nhạc Jazz" thập niên 1920.',
        'Harper Lee' => 'Nhà văn Mỹ, giải Pulitzer 1961 với tiểu thuyết Giết con chim nhại.',
        'Jane Austen' => 'Nữ văn sĩ Anh với các tiểu thuyết lãng mạn sắc sảo về xã hội thế kỷ 19.',
        'Victor Hugo' => 'Đại văn hào Pháp, tác giả Những người khốn khổ và Nhà thờ Đức Bà Paris.',
        'Emily Brontë' => 'Nữ thi sĩ, nhà văn Anh, tác giả tiểu thuyết duy nhất Đồi gió hú.',
        'Mario Puzo' => 'Nhà văn, nhà biên kịch Mỹ gốc Ý, cha đẻ của Bố già.',
        'Khaled Hosseini' => 'Nhà văn, bác sĩ người Mỹ gốc Afghanistan.',
        'Markus Zusak' => 'Nhà văn Úc, tác giả tiểu thuyết Kẻ trộm sách.',
        'J. D. Salinger' => 'Nhà văn Mỹ, tác giả tiểu thuyết kinh điển về tuổi mới lớn Bắt trẻ đồng xanh.',
        'J. K. Rowling' => 'Nhà văn Anh, tác giả bộ truyện Harry Potter.',
        'J. R. R. Tolkien' => 'Nhà văn, nhà ngôn ngữ học Anh, cha đẻ của thế giới Trung Địa.',
        'Roald Dahl' => 'Nhà văn Anh nổi tiếng với các truyện thiếu nhi giàu trí tưởng tượng.',
        'Tetsuko Kuroyanagi' => 'Nữ diễn viên, người dẫn chương trình truyền hình Nhật Bản.',
        'Jules Verne' => 'Nhà văn Pháp, người đặt nền móng cho thể loại khoa học viễn tưởng.',
        'Hector Malot' => 'Nhà văn Pháp thế kỷ 19, tác giả Không gia đình.',
        'Anne Frank' => 'Cô bé người Do Thái, tác giả cuốn nhật ký viết trong thời gian lẩn trốn phát xít.',
        'Keigo Higashino' => 'Nhà văn trinh thám hàng đầu Nhật Bản.',
        'Stieg Larsson' => 'Nhà báo, nhà văn Thụy Điển, tác giả bộ ba Millennium.',
        'Andy Weir' => 'Kỹ sư phần mềm, nhà văn khoa học viễn tưởng người Mỹ.',
        'Orson Scott Card' => 'Nhà văn khoa học viễn tưởng Mỹ, hai lần đoạt cả giải Hugo và Nebula.',
        'Ray Bradbury' => 'Nhà văn Mỹ với nhiều tác phẩm khoa học viễn tưởng kinh điển.',
        'Charles Duhigg' => 'Nhà báo đoạt giải Pulitzer, chuyên viết về năng suất và thói quen.',
        'Robin Sharma' => 'Diễn giả, chuyên gia phát triển bản thân người Canada.',
        'Carol S. Dweck' => 'Giáo sư tâm lý học Đại học Stanford, người đề xuất khái niệm tư duy phát triển.',
        'Cal Newport' => 'Giáo sư khoa học máy tính Đại học Georgetown, tác giả nhiều sách về năng suất.',
        'Keith Ferrazzi' => 'Chuyên gia tư vấn về quan hệ và lãnh đạo người Mỹ.',
        'Benjamin Graham' => 'Nhà kinh tế học, "cha đẻ" của trường phái đầu tư giá trị.',
        'Jim Collins' => 'Nhà nghiên cứu quản trị, tác giả nhiều sách kinh doanh bán chạy.',
        'Eric Ries' => 'Doanh nhân, người khởi xướng phương pháp Lean Startup.',
        'Peter Thiel' => 'Doanh nhân, nhà đầu tư, đồng sáng lập PayPal.',
        'Steven D. Levitt' => 'Nhà kinh tế học Đại học Chicago, đồng tác giả Freakonomics.',
        'Martin Fowler' => 'Kỹ sư phần mềm người Anh, chuyên gia về tái cấu trúc mã và kiến trúc phần mềm.',
        'Erich Gamma' => 'Kỹ sư phần mềm Thụy Sĩ, thành viên nhóm "Gang of Four".',
        'Thomas H. Cormen' => 'Giáo sư khoa học máy tính Đại học Dartmouth.',
        'Douglas Crockford' => 'Lập trình viên Mỹ, người phổ biến định dạng dữ liệu JSON.',
        'Marijn Haverbeke' => 'Lập trình viên Hà Lan, tác giả của CodeMirror và Eloquent JavaScript.',
        'Steve McConnell' => 'Chuyên gia kỹ nghệ phần mềm, tác giả Code Complete.',
        'Richard Dawkins' => 'Nhà sinh học tiến hoá người Anh, giáo sư Đại học Oxford.',
        'Carl Sagan' => 'Nhà thiên văn học, nhà phổ biến khoa học người Mỹ.',
        'Bill Bryson' => 'Nhà văn Mỹ - Anh nổi tiếng với các sách du ký và khoa học phổ thông.',
        'Viktor E. Frankl' => 'Bác sĩ tâm thần người Áo, người sáng lập liệu pháp ý nghĩa.',
        'Daniel Goleman' => 'Nhà tâm lý học, nhà báo khoa học người Mỹ.',
        'Susan Cain' => 'Luật sư, nhà văn người Mỹ, tác giả cuốn sách về người hướng nội.',
        'Marcus Aurelius' => 'Hoàng đế La Mã, triết gia trường phái Khắc kỷ.',
        'Baird T. Spalding' => 'Tác giả người Mỹ của bộ sách về minh triết phương Đông.',
        'Norman Lewis' => 'Nhà ngôn ngữ học, tác giả nhiều giáo trình từ vựng tiếng Anh.',
    ];

    public function run(): void
    {
        mt_srand(2026);

        $this->realCatalog = require __DIR__.'/data/real_catalog.php';
        $this->authors += $this->extraAuthors;
        $this->books = array_merge($this->books, $this->realCatalog['books']);

        $categoryIds = $this->seedCategories();
        $authorIds = $this->seedAuthors();
        $books = $this->seedBooks($categoryIds, $authorIds);

        if (User::where('email', self::MARKER_EMAIL)->exists()) {
            $this->command?->info('RichDemoSeeder: dữ liệu giao dịch đã tồn tại, chỉ cập nhật danh mục sách.');

            return;
        }

        $readers = $this->seedUsers();
        $staffIds = User::whereHas('role', fn ($q) => $q->whereIn('name', [Role::STAFF, Role::ADMIN]))->pluck('id')->all();

        DB::transaction(function () use ($books, $readers, $staffIds) {
            $returned = $this->seedBorrowHistory($books, $readers, $staffIds);
            $this->seedReviews($returned);
            $this->seedFavorites($books, $readers);
            $this->syncAvailability($books, $readers);
            $this->seedAiLogs($books, $readers);
        });

        Book::whereIn('title', ['Nhà Giả Kim', 'Tam thể', 'Atomic Habits - Thay đổi tí hon, hiệu quả bất ngờ', 'Hoàng tử bé', 'Sapiens: Lược Sử Loài Người'])
            ->update(['is_featured' => true]);
    }

    private function seedCategories(): array
    {
        $ids = [];
        foreach ($this->categories as $name => $description) {
            $ids[$name] = Category::firstOrCreate(['name' => $name], ['description' => $description])->id;
        }

        return $ids;
    }

    private function seedAuthors(): array
    {
        $ids = [];
        foreach ($this->authors as $name => $bio) {
            $ids[$name] = Author::firstOrCreate(['name' => $name], ['biography' => $bio])->id;
        }

        return $ids;
    }

    private function seedBooks(array $categoryIds, array $authorIds)
    {
        $covers = $this->realCatalog['covers'];

        foreach ($this->books as $i => [$title, $category, $authors, $quantity, $fee, $description]) {
            $book = Book::firstOrNew(['title' => $title]);
            if (! $book->exists) {
                $book->fill([
                    'category_id' => $categoryIds[$category],
                    'description' => $description,
                    'quantity' => $quantity,
                    'available_quantity' => $quantity,
                    'borrow_fee' => $fee,
                    'status' => Book::STATUS_AVAILABLE,
                ]);
                // rải ngày nhập sách để mục "Sách mới" có thứ tự tự nhiên
                $book->created_at = now()->subDays(max(1, 150 - $i));
                $book->save();
            }
            if (isset($covers[$title]) && $book->cover_image !== $covers[$title]) {
                $book->update(['cover_image' => $covers[$title]]);
            }
            $book->authors()->syncWithoutDetaching(array_map(fn ($a) => $authorIds[$a], $authors));
        }

        // một vài sách ở trạng thái đặc biệt để minh hoạ bộ lọc tình trạng
        Book::where('title', 'Vũ trụ trong vỏ hạt dẻ')->update(['status' => Book::STATUS_DAMAGED]);
        Book::where('title', 'Kafka bên bờ biển')->update(['status' => Book::STATUS_UNAVAILABLE]);

        return Book::all();
    }

    private function seedUsers()
    {
        $readerRole = Role::where('name', Role::READER)->value('id');
        $staffRole = Role::where('name', Role::STAFF)->value('id');
        $readerPassword = Hash::make('reader123');

        foreach ([['Phạm Thị Thu Hằng', 'nhanvien2@thuvien.vn'], ['Lê Văn Khải', 'nhanvien3@thuvien.vn']] as [$name, $email]) {
            User::firstOrCreate(['email' => $email], [
                'name' => $name, 'password' => Hash::make('staff123'), 'role_id' => $staffRole,
                'phone' => '09'.mt_rand(10000000, 99999999), 'is_active' => true,
            ]);
        }

        $streets = ['Láng Hạ', 'Cầu Giấy', 'Xuân Thuỷ', 'Kim Mã', 'Nguyễn Trãi', 'Lê Lợi', 'Trần Phú', 'Hai Bà Trưng'];
        $readers = collect();
        foreach ($this->readerNames as $i => $name) {
            $user = User::create([
                'name' => $name,
                'email' => sprintf('docgia%02d@demo.thuvien.vn', $i + 1),
                'password' => $readerPassword,
                'role_id' => $readerRole,
                'phone' => '09'.mt_rand(10000000, 99999999),
                'address' => mt_rand(1, 200).' '.$streets[array_rand($streets)].', Hà Nội',
                'is_active' => $i !== 39, // một tài khoản bị khoá để demo chức năng khoá/mở khoá
            ]);
            $user->forceFill(['created_at' => now()->subDays(mt_rand(30, 180))])->saveQuietly();
            $readers->push($user);
        }

        return $readers;
    }

    /**
     * Sinh lịch sử mượn - trả cho ~4 tháng gần nhất, trạng thái suy ra từ thời điểm tạo yêu cầu.
     * Trả về danh sách [user_id, book_id] của các lượt đã thực sự mượn (dùng để sinh đánh giá).
     */
    private function seedBorrowHistory($books, $readers, array $staffIds): array
    {
        $lendable = $books->where('status', Book::STATUS_AVAILABLE)->values();
        // sách "hot" được mượn nhiều hơn để thống kê có phân hoá rõ ràng
        $weights = $lendable->mapWithKeys(fn ($b) => [$b->id => $b->quantity + (in_array($b->title, [
            'Nhà Giả Kim', 'Đắc Nhân Tâm', 'Atomic Habits - Thay đổi tí hon, hiệu quả bất ngờ', 'Tam thể',
            'Clean Code', 'Mắt biếc', 'Hoàng tử bé', 'Sapiens: Lược Sử Loài Người',
        ], true) ? 8 : 0)])->all();

        $activeReaders = $readers->where('is_active', true)->values();
        $active = [];          // user_id => số lượt đang mượn/chờ
        $activePairs = [];     // "user-book" đang mượn/chờ
        $hasOverdue = [];      // user_id => true
        $borrowedPairs = [];

        for ($n = 0; $n < 260; $n++) {
            $daysAgo = (int) floor(pow(mt_rand(0, 1000) / 1000, 1.3) * 120);
            $reader = $activeReaders[mt_rand(0, $activeReaders->count() - 1)];
            $book = $lendable->firstWhere('id', $this->weightedPick($weights));
            $pairKey = "{$reader->id}-{$book->id}";

            $created = now()->subDays($daysAgo)->setTime(mt_rand(8, 20), mt_rand(0, 59));
            $status = $this->pickStatus($daysAgo);

            $isActive = in_array($status, [BorrowRecord::STATUS_PENDING, BorrowRecord::STATUS_BORROWED, BorrowRecord::STATUS_OVERDUE], true);
            if ($isActive && (($active[$reader->id] ?? 0) >= 4 || isset($activePairs[$pairKey]))) {
                $status = $daysAgo > 3 ? BorrowRecord::STATUS_RETURNED : BorrowRecord::STATUS_CANCELLED;
                $isActive = false;
            }
            if ($status === BorrowRecord::STATUS_OVERDUE && isset($hasOverdue[$reader->id])) {
                $status = BorrowRecord::STATUS_RETURNED;
                $isActive = false;
            }
            if ($status === BorrowRecord::STATUS_RETURNED && $daysAgo < 2) {
                $status = BorrowRecord::STATUS_BORROWED;
                $isActive = ! isset($activePairs[$pairKey]) && ($active[$reader->id] ?? 0) < 4;
                if (! $isActive) {
                    $status = BorrowRecord::STATUS_CANCELLED;
                }
            }

            $borrowDate = $created->copy()->startOfDay();
            $dueDate = $borrowDate->copy()->addDays(BorrowRecord::DEFAULT_BORROW_DAYS);
            $returnDate = null;
            $renewed = 0;
            $lateDays = 0;

            if ($status === BorrowRecord::STATUS_BORROWED && $dueDate->lt(today())) {
                // đang mượn nhưng đã qua hạn gốc -> coi như đã gia hạn để không bị quá hạn
                $renewed = 1;
                $dueDate->addDays(BorrowRecord::RENEWAL_EXTRA_DAYS);
                if ($dueDate->lt(today())) {
                    $status = BorrowRecord::STATUS_OVERDUE;
                }
            }

            if ($status === BorrowRecord::STATUS_RETURNED) {
                $late = mt_rand(1, 100) <= 18;
                $returnDate = $late
                    ? $dueDate->copy()->addDays(mt_rand(1, 9))
                    : $borrowDate->copy()->addDays(mt_rand(3, BorrowRecord::DEFAULT_BORROW_DAYS));
                if ($returnDate->gt(today())) {
                    $returnDate = today()->copy();
                }
                $lateDays = $returnDate->gt($dueDate) ? $dueDate->diffInDays($returnDate) : 0;
            }

            $updated = $returnDate ? $returnDate->copy()->setTime(mt_rand(8, 18), mt_rand(0, 59)) : $created;
            $recordId = DB::table('borrow_records')->insertGetId([
                'user_id' => $reader->id,
                'book_id' => $book->id,
                'confirmed_by' => $status === BorrowRecord::STATUS_PENDING ? null : $staffIds[array_rand($staffIds)],
                'borrow_date' => $borrowDate->toDateString(),
                'due_date' => $dueDate->toDateString(),
                'return_date' => $returnDate?->toDateString(),
                'status' => $status,
                'renewed_count' => $renewed,
                'created_at' => $created,
                'updated_at' => $updated,
            ]);

            if ((float) $book->borrow_fee > 0) {
                $paymentStatus = match (true) {
                    $status === BorrowRecord::STATUS_CANCELLED => Payment::STATUS_FAILED,
                    $status === BorrowRecord::STATUS_PENDING && mt_rand(0, 1) === 0 => Payment::STATUS_PENDING,
                    default => Payment::STATUS_PAID,
                };
                $paidAt = $paymentStatus === Payment::STATUS_PAID ? $created->copy()->addMinutes(mt_rand(2, 90)) : null;
                DB::table('payments')->insert([
                    'borrow_record_id' => $recordId,
                    'user_id' => $reader->id,
                    'amount' => $book->borrow_fee,
                    'payment_status' => $paymentStatus,
                    'paid_at' => $paidAt,
                    'created_at' => $created,
                    'updated_at' => $paidAt ?? $created,
                ]);
            }

            if ($lateDays > 0) {
                $paid = mt_rand(1, 100) <= 65;
                DB::table('fines')->insert([
                    'borrow_record_id' => $recordId,
                    'amount' => $lateDays * Fine::FINE_PER_DAY,
                    'reason' => "Trả sách trễ hạn {$lateDays} ngày",
                    'status' => $paid ? Fine::STATUS_PAID : Fine::STATUS_UNPAID,
                    'created_at' => $updated,
                    'updated_at' => $paid ? $updated->copy()->addDays(mt_rand(0, 3)) : $updated,
                ]);
            }

            if ($isActive) {
                $active[$reader->id] = ($active[$reader->id] ?? 0) + 1;
                $activePairs[$pairKey] = true;
            }
            if ($status === BorrowRecord::STATUS_OVERDUE) {
                $hasOverdue[$reader->id] = true;
            }
            if (in_array($status, [BorrowRecord::STATUS_RETURNED, BorrowRecord::STATUS_BORROWED, BorrowRecord::STATUS_OVERDUE], true)) {
                $borrowedPairs[$pairKey] = [$reader->id, $book->id, $returnDate ?? $created];
            }
        }

        return array_values($borrowedPairs);
    }

    private function pickStatus(int $daysAgo): string
    {
        $r = mt_rand(1, 100);

        return match (true) {
            $daysAgo <= 4 => $r <= 60 ? BorrowRecord::STATUS_PENDING : ($r <= 92 ? BorrowRecord::STATUS_BORROWED : BorrowRecord::STATUS_CANCELLED),
            $daysAgo <= 14 => $r <= 55 ? BorrowRecord::STATUS_BORROWED : ($r <= 92 ? BorrowRecord::STATUS_RETURNED : BorrowRecord::STATUS_CANCELLED),
            $daysAgo <= 35 => $r <= 20 ? BorrowRecord::STATUS_BORROWED : ($r <= 32 ? BorrowRecord::STATUS_OVERDUE : ($r <= 94 ? BorrowRecord::STATUS_RETURNED : BorrowRecord::STATUS_CANCELLED)),
            default => $r <= 93 ? BorrowRecord::STATUS_RETURNED : BorrowRecord::STATUS_CANCELLED,
        };
    }

    private function seedReviews(array $borrowedPairs): void
    {
        foreach ($borrowedPairs as [$userId, $bookId, $at]) {
            if (mt_rand(1, 100) > 55) {
                continue;
            }
            $r = mt_rand(1, 100);
            $rating = $r <= 45 ? 5 : ($r <= 80 ? 4 : ($r <= 94 ? 3 : 2));
            $comments = $this->reviewComments[$rating];
            $when = Carbon::parse($at)->addDays(mt_rand(0, 3))->min(now());
            DB::table('reviews')->insertOrIgnore([
                'user_id' => $userId,
                'book_id' => $bookId,
                'rating' => $rating,
                'comment' => mt_rand(1, 100) <= 85 ? $comments[array_rand($comments)] : null,
                'created_at' => $when,
                'updated_at' => $when,
            ]);
        }

        Book::all()->each->refreshAvgRating();
    }

    private function seedFavorites($books, $readers): void
    {
        $ids = $books->pluck('id')->all();
        foreach ($readers as $reader) {
            $picked = (array) array_rand(array_flip($ids), mt_rand(2, 7));
            foreach ($picked as $bookId) {
                $when = now()->subDays(mt_rand(0, 90));
                DB::table('favorites')->insertOrIgnore([
                    'user_id' => $reader->id, 'book_id' => $bookId, 'created_at' => $when, 'updated_at' => $when,
                ]);
            }
        }
    }

    /**
     * Tính lại số lượng còn lại cho khớp với số lượt đang mượn, sau đó làm "cháy hàng" vài sách hot
     * và cho độc giả xếp hàng đặt trước để minh hoạ chức năng đặt trước.
     */
    private function syncAvailability($books, $readers): void
    {
        $activeStatuses = [BorrowRecord::STATUS_BORROWED, BorrowRecord::STATUS_OVERDUE];

        foreach ($books as $book) {
            $out = BorrowRecord::where('book_id', $book->id)->whereIn('status', $activeStatuses)->count();
            $book->update([
                'quantity' => max($book->quantity, $out),
                'available_quantity' => max(0, max($book->quantity, $out) - $out),
            ]);
        }

        $activeReaders = $readers->where('is_active', true)->values();
        foreach (['Cha Giàu Cha Nghèo', 'Tam thể', 'Atomic Habits - Thay đổi tí hon, hiệu quả bất ngờ'] as $title) {
            $book = Book::where('title', $title)->first();
            if (! $book) {
                continue;
            }

            $holders = BorrowRecord::where('book_id', $book->id)->whereIn('status', $activeStatuses)->pluck('user_id')->all();
            $candidates = $activeReaders->whereNotIn('id', $holders)->shuffle()->values();
            $i = 0;
            while ($book->available_quantity > 0 && $i < $candidates->count()) {
                $borrowDate = today()->subDays(mt_rand(1, 10));
                $record = BorrowRecord::create([
                    'user_id' => $candidates[$i++]->id,
                    'book_id' => $book->id,
                    'confirmed_by' => User::whereHas('role', fn ($q) => $q->where('name', Role::STAFF))->value('id'),
                    'borrow_date' => $borrowDate->toDateString(),
                    'due_date' => $borrowDate->copy()->addDays(BorrowRecord::DEFAULT_BORROW_DAYS)->toDateString(),
                    'status' => BorrowRecord::STATUS_BORROWED,
                ]);
                if ((float) $book->borrow_fee > 0) {
                    Payment::create([
                        'borrow_record_id' => $record->id, 'user_id' => $record->user_id, 'amount' => $book->borrow_fee,
                        'payment_status' => Payment::STATUS_PAID, 'paid_at' => $borrowDate->copy()->setTime(9, 30),
                    ]);
                }
                $holders[] = $record->user_id;
                $book->decrement('available_quantity');
            }

            foreach ($activeReaders->whereNotIn('id', $holders)->shuffle()->take(mt_rand(2, 4)) as $k => $reader) {
                $res = Reservation::firstOrCreate(
                    ['user_id' => $reader->id, 'book_id' => $book->id, 'status' => Reservation::STATUS_WAITING]
                );
                $res->forceFill(['created_at' => now()->subHours(48 - $k * 6)])->saveQuietly();
            }
        }

        // vài lượt đặt trước đã hoàn tất / đã huỷ trong quá khứ
        foreach ($activeReaders->shuffle()->take(6) as $k => $reader) {
            Reservation::create([
                'user_id' => $reader->id,
                'book_id' => $books->random()->id,
                'status' => $k % 2 === 0 ? Reservation::STATUS_DONE : Reservation::STATUS_CANCELLED,
            ])->forceFill(['created_at' => now()->subDays(mt_rand(15, 80))])->saveQuietly();
        }
    }

    private function seedAiLogs($books, $readers): void
    {
        $sources = [AiRecommendationLog::SOURCE_SEARCH, AiRecommendationLog::SOURCE_PERSONALIZED, AiRecommendationLog::SOURCE_SIMILAR];
        $reasons = [
            AiRecommendationLog::SOURCE_SEARCH => 'Tên sách khớp với nội dung bạn tìm kiếm',
            AiRecommendationLog::SOURCE_PERSONALIZED => 'Cùng thể loại với những sách bạn đã mượn/yêu thích',
            AiRecommendationLog::SOURCE_SIMILAR => 'Cùng thể loại với cuốn sách bạn đang xem',
        ];
        $rows = [];
        for ($i = 0; $i < 220; $i++) {
            $source = $sources[mt_rand(0, 2)];
            $when = now()->subDays(mt_rand(0, 60))->subMinutes(mt_rand(0, 1440));
            $rows[] = [
                'user_id' => mt_rand(0, 3) === 0 ? null : $readers->random()->id,
                'book_id' => $books->random()->id,
                'source' => $source,
                'query' => $source === AiRecommendationLog::SOURCE_SEARCH ? $this->aiQueries[array_rand($this->aiQueries)] : null,
                'reason' => $reasons[$source],
                'created_at' => $when,
                'updated_at' => $when,
            ];
        }
        DB::table('ai_recommendation_logs')->insert($rows);
    }

    private function weightedPick(array $weights): int
    {
        $total = array_sum($weights);
        $r = mt_rand(1, $total);
        foreach ($weights as $id => $w) {
            $r -= $w;
            if ($r <= 0) {
                return $id;
            }
        }

        return array_key_first($weights);
    }
}
