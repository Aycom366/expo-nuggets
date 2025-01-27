import { View, StyleSheet, FlatList, TouchableOpacity, FlatListProps } from "react-native";
import { memo } from "react";
import { Canvas, ColorMatrix, Image, useImage } from "@shopify/react-native-skia";
import { colorMatrix } from "@/utils/color-matrix";

interface IProps {
  currentIndex: number;
  extraStyle?: FlatListProps<any>["style"];
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
}

//Apologies for the any type, I got too lazy to type
const FilterOptionCard = memo(({ index, selectedIndex, setCurrentIndex, matrix }: any) => {
  const image = useImage(require("../assets/images/favicon.png"));
  return (
    <TouchableOpacity onPress={() => setCurrentIndex(index)}>
      <View style={filterStyles.item}>
        <View style={selectedIndex === index ? filterStyles.canvasContainer : {}}>
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

export const Filters = ({ currentIndex, setCurrentIndex, extraStyle }: IProps) => {
  return (
    <View style={[filterStyles.container, extraStyle]}>
      <FlatList
        data={colorMatrix}
        initialNumToRender={5}
        renderItem={({ item, index }) => (
          <FilterOptionCard
            id={item.title}
            matrixKey={item.title}
            index={index}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
            selectedIndex={currentIndex}
            setSelectedIndex={setCurrentIndex}
            matrix={item.matrix}
          />
        )}
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
