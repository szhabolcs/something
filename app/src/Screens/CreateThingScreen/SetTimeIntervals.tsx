import { Pressable, StyleSheet, Text } from "react-native";
import React, { useState } from "react";
import Column from "../../components/atoms/Column";
import Row from "../../components/atoms/Row";
import MyButton from "../../components/molecules/MyButton";
import H2 from "../../components/atoms/H2";
import {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Dropdown } from "react-native-element-dropdown";
import BigText from "../../components/atoms/BigText";
import { useAppDispatch } from "../../hooks/hooks";
import { setOccuranceForNewPersonalThing } from "../../redux/thing/ThingStack";

const SetTimeIntervals = ({ navigation }: any) => {
  const [startDate, setStartDate] = useState(new Date(Date.now()));
  const daysOfWeek = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const [endDate, setEndDate] = useState(
    new Date(new Date(Date.now()).setHours(startDate.getHours() + 1))
  );
  const dispatch = useAppDispatch();
  const [value, setValue] = useState("every");
  const [period, setPeriod] = useState("daily");
  const [day, setDay] = useState(daysOfWeek[new Date(Date.now()).getDay()]);

  const onSave = () => {
    if (startDate > endDate) {
      return;
    }

    if (value === "once") {
      dispatch(
        setOccuranceForNewPersonalThing({
          startTime: `${formatDate(startDate)}:00`,
          endTime: `${formatDate(endDate)}:00`,
          repeat: "once",
          daysOfWeek: [],
        })
      );
      return;
    }

    dispatch(
      setOccuranceForNewPersonalThing({
        startTime: `${formatDate(startDate)}:00`,
        endTime: `${formatDate(endDate)}:00`,
        repeat: period,
        dayOfWeek: period !== "daily" ? [day] : [],
      })
    );
  };

  const onStartDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date | undefined
  ) => {
    const currentDate = selectedDate;
    setStartDate(currentDate ?? new Date(Date.now()));
  };

  const onEndDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date | undefined
  ) => {
    const currentDate = selectedDate;
    setEndDate(currentDate ?? new Date(Date.now()));
  };

  const showMode = (currentMode: any, onChange: (item: any) => void) => {
    DateTimePickerAndroid.open({
      value: startDate,
      onChange,
      mode: currentMode,
      is24Hour: true,
    });
  };

  const showTimepicker = (onChange: (item: any) => void) => {
    showMode("time", onChange);
  };

  const formatDate = (date: Date, additionalHours?: number) => {
    let newDate = new Date(date);
    newDate = new Date(
      newDate.setHours(date.getHours() + (additionalHours || 0))
    );

    return `${newDate.getHours()}:${newDate.getMinutes()}`;
  };

  return (
    <Column
      styles={{
        flex: 1,
        padding: 16,
        justifyContent: "space-between",
      }}
    >
      <Column>
        <BigText>
          I want to do this <BigText accent>Thing</BigText> from{" "}
        </BigText>
        <Row
          styles={{
            alignItems: "center",
          }}
        >
          <Pressable
            onPress={() => {
              showTimepicker(onStartDateChange);
            }}
          >
            <BigText accent underLine>
              {formatDate(startDate)}{" "}
            </BigText>
          </Pressable>
          <BigText> to </BigText>
          <Pressable
            onPress={() => {
              showTimepicker(onEndDateChange);
            }}
          >
            <BigText accent underLine>
              {formatDate(endDate)}{" "}
            </BigText>
          </Pressable>
        </Row>
        <Row
          styles={{
            gap: 20,
          }}
        >
          <Dropdown
            style={styles.dropdown}
            selectedTextStyle={styles.selectedTextStyle}
            iconStyle={styles.iconStyle}
            itemContainerStyle={{ width: 90 }}
            data={[
              {
                label: "Every",
                value: "every",
              },
              // {
              //   label: "Once",
              //   value: "once",
              // },
            ]}
            labelField="label"
            valueField="value"
            value={value}
            onChange={(item) => {
              setValue(item.value);
            }}
          />
          {value === "every" && (
            <Dropdown
              style={styles.dropdown}
              selectedTextStyle={styles.selectedTextStyle}
              iconStyle={styles.iconStyle}
              itemContainerStyle={{ width: 90 }}
              data={[
                {
                  label: "Day",
                  value: "daily",
                },
                // {
                //   label: "Week",
                //   value: "weekly",
                // },
                // {
                //   label: "Month",
                //   value: "monthly",
                // },
              ]}
              labelField="label"
              valueField="value"
              value={period}
              onChange={(item) => {
                setPeriod(item.value);
              }}
            />
          )}
        </Row>
        {period !== "daily" && value === "every" && (
          <Dropdown
            style={[styles.dropdown, { width: 140 }]}
            selectedTextStyle={styles.selectedTextStyle}
            itemTextStyle={{
              fontSize: 15,
            }}
            renderItem={(item) => {
              return (
                <Text
                  style={{
                    fontSize: 15,
                  }}
                >
                  {item.label}
                </Text>
              );
            }}
            iconStyle={styles.iconStyle}
            itemContainerStyle={{ width: 90 }}
            data={[
              {
                label: "Monday",
                value: "mon",
              },
              {
                label: "Tuesday",
                value: "tue",
              },
              {
                label: "Wednesday",
                value: "wed",
              },
              {
                label: "Thursday",
                value: "thu",
              },
              {
                label: "Friday",
                value: "fri",
              },
              {
                label: "Saturday",
                value: "sat",
              },
              {
                label: "Sunday",
                value: "sun",
              },
            ]}
            labelField="label"
            valueField="value"
            value={day}
            onChange={(item) => {
              setDay(item.value);
            }}
          />
        )}
      </Column>
      <Row
        styles={{
          alignItems: "center",
          justifyContent: "space-evenly",
        }}
      >
        <MyButton
          text={"Cancel"}
          onPress={() => {
            navigation.pop();
          }}
        />
        <MyButton
          text={"Save"}
          accent
          onPress={() => {
            onSave();
            navigation.pop();
          }}
        />
      </Row>
    </Column>
  );
};

export default SetTimeIntervals;

const styles = StyleSheet.create({
  dropdown: {
    width: 90,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedTextStyle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#16a34a",
    textDecorationLine: "underline",
  },
  iconStyle: {
    display: "none",
  },
});
