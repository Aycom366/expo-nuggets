import { View, StyleSheet, FlatList, TouchableOpacity, FlatListProps } from "react-native";
import { memo } from "react";
import { Canvas, ColorMatrix, Image, useImage } from "@shopify/react-native-skia";
import { colorMatrix } from "@/utils/color-matrix";

interface IProps {
  filterIndex: number;
  extraStyle?: FlatListProps<any>["style"];
  setFilterIndex: React.Dispatch<React.SetStateAction<number>>;
}

interface IFilterOptions {
  index: number;
  filterIndex: number;
  setFilterIndex: React.Dispatch<React.SetStateAction<number>>;
  matrix: number[];
}

const FilterOptionCard = memo(({ index, filterIndex, setFilterIndex, matrix }: IFilterOptions) => {
  const image = useImage(require("../assets/images/favicon.png"));
  return (
    <TouchableOpacity
      onPress={() => {
        setFilterIndex(index);
      }}
    >
      <View style={filterStyles.item}>
        <View style={filterIndex === index ? filterStyles.canvasContainer : {}}>
          <Canvas style={{ width: 59, height: 57 }}>
            <Image x={0} y={0} width={59} height={57} image={image} fit="cover">
              <ColorMatrix matrix={matrix} />
            </Image>
          </Canvas>
        </View>
      </View>
    </TouchableOpacity>
  );
});

export const Filters = ({ filterIndex, setFilterIndex, extraStyle }: IProps) => {
  return (
    <View style={[filterStyles.container, extraStyle]}>
      <FlatList
        data={colorMatrix}
        initialNumToRender={5}
        renderItem={({ item, index }) => <FilterOptionCard filterIndex={filterIndex} index={index} setFilterIndex={setFilterIndex} matrix={item.matrix} />}
        keyExtractor={(item) => item.title}
        horizontal
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={ItemSeparatorComponent}
      />
    </View>
  );
};

function ItemSeparatorComponent() {
  return <View style={filterStyles.separator}></View>;
}

const filterStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  separator: {
    marginHorizontal: 6,
  },
  containerX: {
    marginHorizontal: 19,
  },

  item: {
    position: "relative",
    alignItems: "center",
    gap: 4,
  },

  canvasContainer: {
    borderWidth: 3,
    borderRadius: 2,
  },
});
