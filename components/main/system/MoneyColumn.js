import {MoneyFormatNumber} from "./MoneyFormatNumber";
import {Space, Typography} from "antd";

const {Text} = Typography;
const MoneyColumn = ({label, value, color, type = 'full', prefix = 'с'}) => {
    return (
        <Space direction="vertical" className="text-center" size={0}>
            <Text type="secondary" className="label-medium">{label}</Text>
            <Text strong className="money-main" style={{color}}>
                {MoneyFormatNumber(value || 0, type)}
                <small className="ms-1 text-decoration-underline money-prefix">
                    {prefix}
                </small>
            </Text>
        </Space>
    );
};

export default MoneyColumn