import React, { useEffect, useState, useCallback } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Image,
	ScrollView,
	Alert,
	Modal,
	TextInput,
	FlatList,
	Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useFocusEffect } from "@react-navigation/native";

const { width } = Dimensions.get("window");

export default function ProfileDetailScreen() {
	const router = useRouter();
	const [userInfo, setUserInfo] = useState({
		name: "",
		email: "",
		userId: "",
		gender: "Other",
		avatar: "😺",
	});
	const [editingField, setEditingField] = useState<null | "nickname" | "id">(null);
	const [tempValue, setTempValue] = useState("");
	const [avatarModalVisible, setAvatarModalVisible] = useState(false);
	const [genderModalVisible, setGenderModalVisible] = useState(false);
	const [deleteModalVisible, setDeleteModalVisible] = useState(false);
	const [linkedAccount, setLinkedAccount] = useState<any>(null);
	const emojis = ["😺", "🐶", "🐸", "🐵", "🦊", "🐰", "🐨", "🦄", "🐼", "🐷"];
	const greenColor = "#87B56C";

useFocusEffect(
  useCallback(() => {
    const loadUser = async () => {
      const storedUser = await SecureStore.getItemAsync("user");
      const storedGender = await SecureStore.getItemAsync("gender");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUserInfo({
          name: parsed.name || "",
          email: parsed.email || "",
          userId: parsed._id || "",
          gender: storedGender || "Other",
          avatar: parsed.avatar || "😺",
        });
      }
    };

    const fetchLinkedAccount = async () => {
      const linked = await SecureStore.getItemAsync("linkedBankAccount");
      if (linked) setLinkedAccount(JSON.parse(linked));
      else setLinkedAccount(null);
    };

    loadUser();
    fetchLinkedAccount();
  }, [])
);

	useFocusEffect(
		useCallback(() => {
			const fetchLinkedAccount = async () => {
				const linked = await SecureStore.getItemAsync("linkedBankAccount");
				if (linked) setLinkedAccount(JSON.parse(linked));
				else setLinkedAccount(null);
			};
			fetchLinkedAccount();
		}, [])
	);

	const handleGenderChange = async (value: string) => {
		setUserInfo((prev) => ({ ...prev, gender: value }));
		await SecureStore.setItemAsync("gender", value);
		setGenderModalVisible(false);
	};

	const handleSignOut = async () => {
		Alert.alert("Sign Out", "Are you sure you want to sign out?", [
			{
				text: "No",
				style: "cancel",
			},
			{
				text: "Yes",
				onPress: async () => {
					const confirmEdit = async () => {
  if (!tempValue.trim()) return; // prevent empty nickname

  // Update userInfo state
  setUserInfo((prev) => ({ ...prev, name: tempValue }));

  // Load current stored user
  const storedUser = await SecureStore.getItemAsync("user");
  if (storedUser) {
    const parsed = JSON.parse(storedUser);
    // Update name
    parsed.name = tempValue;
    // Save updated user back to SecureStore
    await SecureStore.setItemAsync("user", JSON.stringify(parsed));
  }

  setEditingField(null);
};

					// Deleting known keys individually
					await SecureStore.deleteItemAsync("user");
					await SecureStore.deleteItemAsync("gender");
					await SecureStore.deleteItemAsync("linkedBankAccount");
					router.replace("/login");// made the screen navigated to login instead of the forgot password page.
				},
			},
		]);
	};
const confirmEdit = async () => {
  if (!tempValue.trim()) return;

  setUserInfo((prev) => ({ ...prev, name: tempValue }));

  const storedUser = await SecureStore.getItemAsync("user");
  if (storedUser) {
    const parsed = JSON.parse(storedUser);
    parsed.name = tempValue;
    await SecureStore.setItemAsync("user", JSON.stringify(parsed));
  }

  setEditingField(null);
};


	const confirmAvatar = (emoji: string) => {
		setUserInfo((prev) => ({ ...prev, avatar: emoji }));
		setAvatarModalVisible(false);
	};

	const confirmDeleteAccount = async () => {
		// Delete known keys individually and delete all the values under those buttons making the delete button work properly
		await SecureStore.deleteItemAsync("user");
		await SecureStore.deleteItemAsync("gender");
		await SecureStore.deleteItemAsync("linkedBankAccount");
		router.replace("/loginscreen");
	};

	return (
		<View style={styles.container}>
			<TouchableOpacity
				style={styles.backButton}
				onPress={() => router.back()}
			>
				<Ionicons
					name="chevron-back"
					size={24}
					color="black"
				/>
			</TouchableOpacity>

			<Text style={styles.title}>Profile</Text>

			<ScrollView style={styles.scrollContainer}>
				{linkedAccount && (
					<View style={[styles.row, { borderColor: "#6CC551", borderWidth: 2, marginBottom: 10 }]}>
						<Text style={[styles.label, { color: "#6CC551", fontWeight: "bold" }]}>Linked Bank Account</Text>
						<Text style={styles.value}>
							{linkedAccount.accountHolder} (****{linkedAccount.accountNumber?.slice(-4)})
						</Text>
					</View>
				)}
				<TouchableOpacity
					style={styles.row}
					onPress={() => setAvatarModalVisible(true)}
				>
					<Text style={styles.label}>My Avatar</Text>
					<View style={styles.rowRight}>
						<Text style={{ fontSize: 24 }}>{userInfo.avatar}</Text>
						<Ionicons
							name="chevron-forward"
							size={20}
							color="#666"
						/>
					</View>
				</TouchableOpacity>

				{/* ID field (unclickable) */}
				<TouchableOpacity
					style={styles.row}
					activeOpacity={1}
				>
					<Text style={styles.label}>ID</Text>
					<Text style={styles.value}>{userInfo.userId}</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.row}
					onPress={() => {
						setEditingField("nickname");
						setTempValue(userInfo.name);
					}}
				>
					<Text style={styles.label}>Nickname</Text>
					<Text style={styles.value}>{userInfo.name}</Text>
				</TouchableOpacity>

				<View style={styles.row}>
					<Text style={styles.label}>Email</Text>
					<Text style={styles.value}>{userInfo.email}</Text>
				</View>

				<TouchableOpacity
					style={styles.row}
					onPress={() => setGenderModalVisible(true)}
				>
					<Text style={styles.label}>Gender</Text>
					<View style={styles.rowRight}>
						<Text style={styles.value}>{userInfo.gender}</Text>
						<Ionicons
							name="chevron-forward"
							size={20}
							color="#666"
						/>
					</View>
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.signOutButton}
					onPress={handleSignOut}
				>
					<Text style={styles.buttonText}>Sign Out</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.deleteButton}
					onPress={() => setDeleteModalVisible(true)}
				>
					<Text style={styles.buttonText}>Delete Account</Text>
				</TouchableOpacity>
			</ScrollView>

			{/* Bottom Navigation */}
			<View style={styles.bottomNav}>
				<TouchableOpacity
					onPress={() => router.push("/records")}
					style={styles.navItem}
				>
					<Image
						source={require("../assets/icons/records.png")}
						style={styles.navIcon}
					/>
					<Text style={styles.navLabel}>Records</Text>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() => router.push("/charts")}
					style={styles.navItem}
				>
					<Image
						source={require("../assets/icons/charts.png")}
						style={styles.navIcon}
					/>
					<Text style={styles.navLabel}>Charts</Text>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() => router.push("/addExpense")}
					style={styles.fabButtonContainer}
				>
					<View style={styles.fabButton}>
						<Text style={styles.fabText}>+</Text>
					</View>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() => router.push("/reports")}
					style={styles.navItem}
				>
					<Image
						source={require("../assets/icons/reports.png")}
						style={styles.navIcon}
					/>
					<Text style={styles.navLabel}>Reports</Text>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() => router.push("/profile")}
					style={styles.navItem}
				>
					<Image
						source={require("../assets/icons/profile.png")}
						style={styles.navIcon}
					/>
					<Text style={styles.navLabel}>Profile</Text>
				</TouchableOpacity>
			</View>

			{/* Edit Nickname/ID Modal */}
			<Modal
				animationType="fade"
				transparent={true}
				visible={!!editingField}
				onRequestClose={() => setEditingField(null)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContainer}>
						<Text style={styles.modalTitle}>
							Edit {editingField === "nickname" ? "Nickname" : "ID"}
						</Text>
						<TextInput
							style={styles.textInput}
							placeholder={editingField === "nickname" ? "Enter new nickname" : "Enter new ID"}
							value={tempValue}
							onChangeText={setTempValue}
							autoFocus={true}
						/>
						<View style={styles.modalButtons}>
							<TouchableOpacity
								onPress={() => setEditingField(null)}
								style={styles.cancelButton}
							>
								<Text style={{ color: "#000" }}>Cancel</Text>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={confirmEdit}
								style={[styles.confirmButton, { backgroundColor: greenColor }]}
								disabled={!tempValue.trim()}
							>
								<Text style={{ color: "#fff" }}>Confirm</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>

			{/* Avatar Modal */}
			<Modal
				animationType="fade"
				transparent={true}
				visible={avatarModalVisible}
				onRequestClose={() => setAvatarModalVisible(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.avatarModalContainer}>
						<Text style={styles.modalTitle}>Choose Avatar</Text>
						<FlatList
							data={emojis}
							keyExtractor={(item) => item}
							horizontal
							showsHorizontalScrollIndicator={false}
							renderItem={({ item }) => (
								<TouchableOpacity
									style={[
										styles.avatarItem,
										item === userInfo.avatar && {
											backgroundColor: "#6CC551",
											borderWidth: 2,
											borderColor: "#000",
										},
									]}
									onPress={() => confirmAvatar(item)}
								>
									<Text style={{ fontSize: 36 }}>{item}</Text>
								</TouchableOpacity>
							)}
						/>
						<TouchableOpacity
							style={styles.uploadButton}
							onPress={() => Alert.alert("Upload feature not implemented yet")}
						>
							<Text style={{ color: "#000" }}>Upload from Device</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() => setAvatarModalVisible(false)}
							style={styles.cancelButton}
						>
							<Text>Cancel</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>

			{/* Gender Modal */}
			<Modal
				animationType="fade"
				transparent={true}
				visible={genderModalVisible}
				onRequestClose={() => setGenderModalVisible(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContainer}>
						<Text style={styles.modalTitle}>Select Gender</Text>
						{["Male", "Female", "Other"].map((option) => (
							<TouchableOpacity
								key={option}
								style={[
									styles.genderOption,
									userInfo.gender === option && { backgroundColor: greenColor },
								]}
								onPress={() => handleGenderChange(option)}
							>
								<Text style={{ color: userInfo.gender === option ? "#fff" : "#000" }}>
									{option}
								</Text>
							</TouchableOpacity>
						))}
						<TouchableOpacity
							onPress={() => handleGenderChange("I don't want to reveal")}
							style={[
								styles.genderOption,
								userInfo.gender === "I don't want to reveal" && { backgroundColor: greenColor },
							]}
						>
							<Text
								style={{
									color: userInfo.gender === "I don't want to reveal" ? "#fff" : "#000",
								}}
							>
								I don't want to reveal
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() => setGenderModalVisible(false)}
							style={styles.cancelButton}
						>
							<Text>Cancel</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>

			{/* Delete Account Confirmation Modal */}
			<Modal
				animationType="fade"
				transparent={true}
				visible={deleteModalVisible}
				onRequestClose={() => setDeleteModalVisible(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContainer}>
						<Text style={styles.modalTitle}>Delete Account?</Text>
						<Text style={{ marginBottom: 20 }}>
							Are you sure you want to delete your account? This action cannot be undone.
						</Text>
						<View style={styles.modalButtons}>
							<TouchableOpacity
								onPress={() => setDeleteModalVisible(false)}
								style={styles.cancelButton}
							>
								<Text>Cancel</Text>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={confirmDeleteAccount}
								style={[styles.confirmButton, { backgroundColor: "#FF3333" }]}
							>
								<Text style={{ color: "#fff" }}>Delete</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#cdc7c7",
		paddingTop: 30,
	},
	backButton: {
		marginLeft: 10,
		marginBottom: 5,
	},
	title: {
		fontSize: 28,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 10,
	},
	scrollContainer: {
		paddingHorizontal: 15,
	},
	row: {
		backgroundColor: "#fff",
		padding: 15,
		borderRadius: 8,
		marginBottom: 12,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	rowRight: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10, 
	},
	label: {
		fontSize: 16,
		color: "#444",
		fontWeight: "bold",
	},
	value: {
		fontSize: 16,
		color: "#444",
	},
	signOutButton: {
		backgroundColor: "#6CC551",
		padding: 15,
		borderRadius: 8,
		marginTop: 20,
		alignItems: "center",
	},
	deleteButton: {
		backgroundColor: "#FF3333",
		padding: 15,
		borderRadius: 8,
		marginTop: 10,
		alignItems: "center",
	},
	buttonText: {
		color: "#fff",
		fontWeight: "bold",
		fontSize: 16,
	},
	bottomNav: {
		flexDirection: "row",
		justifyContent: "space-around",
		paddingVertical: 10,
		backgroundColor: "#fff",
		borderTopWidth: 1,
		borderColor: "#ddd",
	},
	navItem: {
		alignItems: "center",
	},
	navIcon: {
		width: 24,
		height: 24,
		resizeMode: "contain",
		marginBottom: 4,
	},
	navLabel: {
		fontSize: 12,
		color: "#444",
	},
	fabButtonContainer: {
		position: "relative",
		bottom: 15,
	},
	fabButton: {
		backgroundColor: "#6CC551",
		width: 55,
		height: 55,
		borderRadius: 27.5,
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#000",
		shadowOpacity: 0.3,
		shadowRadius: 3,
		elevation: 5,
	},
	fabText: {
		color: "#fff",
		fontSize: 32,
		lineHeight: 32,
		fontWeight: "bold",
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.3)",
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 15,
	},
	modalContainer: {
		backgroundColor: "#fff",
		borderRadius: 10,
		padding: 20,
		width: "100%",
		maxWidth: 400,
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 15,
		textAlign: "center",
	},
	textInput: {
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 8,
		padding: 10,
		marginBottom: 20,
		fontSize: 16,
	},
	modalButtons: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	cancelButton: {
		padding: 12,
		borderRadius: 8,
		backgroundColor: "#ddd",
		flex: 1,
		marginRight: 10,
		alignItems: "center",
	},
	confirmButton: {
		padding: 12,
		borderRadius: 8,
		flex: 1,
		alignItems: "center",
	},
	avatarModalContainer: {
		backgroundColor: "#fff",
		borderRadius: 10,
		padding: 20,
		width: "100%",
		maxWidth: 400,
		alignItems: "center",
	},
	avatarItem: {
		padding: 10,
		marginHorizontal: 5,
		borderRadius: 10,
		justifyContent: "center",
		alignItems: "center",
	},
	uploadButton: {
		marginTop: 20,
		padding: 12,
		backgroundColor: "#D9D9D9",
		borderRadius: 8,
		alignItems: "center",
		width: "100%",
	},
	genderOption: {
		padding: 12,
		marginBottom: 10,
		borderRadius: 8,
		alignItems: "center",
		backgroundColor: "#eee",
	},
});
